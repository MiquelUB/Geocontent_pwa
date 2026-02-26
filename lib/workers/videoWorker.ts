import { Worker } from 'bullmq';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import os from 'os';
import https from 'https';
import http from 'http';
import { getConnection } from '../queue/client';

// Set ffmpeg path to static binary
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

interface TranscodeResult {
  /** 720p HLS manifest path */
  hls: string;
  /** 480p progressive MP4 path */
  lowRes: string;
  /** Thumbnail at 1s */
  thumb: string;
  /** Duration in seconds */
  duration: number;
  /** Total size in bytes (720p segments + 480p file) */
  totalSizeBytes: number;
}

const MAX_TOTAL_SIZE_BYTES = 35 * 1024 * 1024; // 35MB budget

/**
 * Get total size of all files in a directory.
 */
function getDirectorySize(dirPath: string): number {
  let total = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) total += stat.size;
  }
  return total;
}

/**
 * Transcodes video to:
 * 1. 720p HLS (adaptive streaming, 6s segments)
 * 2. 480p progressive MP4 (low-bitrate fallback for slow networks / offline caching)
 * 3. Thumbnail at 1s mark
 *
 * Enforces 120s max duration and warns if 35MB budget is exceeded.
 */
export const processVideoToHLS = async (
  inputPath: string,
  outputDir: string,
  fileName: string
): Promise<TranscodeResult> => {
  const hlsPath = path.join(outputDir, `${fileName}.m3u8`);
  const lowResPath = path.join(outputDir, `${fileName}_480p.mp4`);
  const thumbName = `${fileName}_thumb.jpg`;
  const thumbPath = path.join(outputDir, thumbName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    // 1. Duration Validation
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(new Error(`ffprobe error: ${err.message}`));

      const duration = metadata.format.duration || 0;
      if (duration > 120) {
        return reject(new Error('VÍDEO MASSA LLARG: Màxim 120 segons.'));
      }

      // 2. 720p HLS Pipeline
      ffmpeg(inputPath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 6',
          '-hls_list_size 0',
          '-f hls',
          '-vf scale=-2:720',
        ])
        .output(hlsPath)
        .on('end', () => {
          // 3. 480p Low-Bitrate Progressive MP4
          ffmpeg(inputPath)
            .outputOptions([
              '-vf scale=-2:480',
              '-b:v 500k',
              '-maxrate 600k',
              '-bufsize 1200k',
              '-movflags +faststart', // Progressive download
              '-preset fast',
            ])
            .output(lowResPath)
            .on('end', () => {
              // 4. Thumbnail Generation
              ffmpeg(inputPath)
                .screenshots({
                  timestamps: [1],
                  filename: thumbName,
                  folder: outputDir,
                  size: '720x?',
                })
                .on('end', () => {
                  const totalSizeBytes = getDirectorySize(outputDir);

                  if (totalSizeBytes > MAX_TOTAL_SIZE_BYTES) {
                    console.warn(
                      `[VideoWorker] ⚠️ Output exceeds 35MB budget: ${(totalSizeBytes / 1024 / 1024).toFixed(1)}MB for ${fileName}`
                    );
                  }

                  resolve({
                    hls: hlsPath,
                    lowRes: lowResPath,
                    thumb: thumbPath,
                    duration,
                    totalSizeBytes,
                  });
                })
                .on('error', (err) =>
                  reject(new Error(`Thumbnail error: ${err.message}`))
                );
            })
            .on('error', (err) =>
              reject(new Error(`480p transcode error: ${err.message}`))
            )
            .run();
        })
        .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .run();
    });
  });
};

/**
 * Downloads a remote URL to a local tmp file.
 * Returns the local file path.
 */
async function downloadToTemp(url: string, ext: string): Promise<string> {
  const tmpPath = path.join(os.tmpdir(), `geocontent-dl-${Date.now()}.${ext}`);
  const file = fs.createWriteStream(tmpPath);
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(tmpPath); });
    }).on('error', (err) => {
      fs.unlink(tmpPath, () => {});
      reject(err);
    });
  });
}

/**
 * Snack pipeline: 480p MP4 + thumbnail only.
 * Fast. Designed for short clips <30s meant for offline download.
 */
async function processSnack(
  inputPath: string,
  outputDir: string,
  fileName: string
): Promise<Omit<TranscodeResult, 'hls'>> {
  const lowResPath = path.join(outputDir, `${fileName}_480p.mp4`);
  const thumbName = `${fileName}_thumb.jpg`;
  const thumbPath = path.join(outputDir, thumbName);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, meta) => {
      if (err) return reject(new Error(`ffprobe error: ${err.message}`));
      const duration = meta.format.duration ?? 0;

      ffmpeg(inputPath)
        .outputOptions(['-vf scale=-2:480', '-b:v 500k', '-maxrate 600k', '-bufsize 1200k', '-movflags +faststart', '-preset fast'])
        .output(lowResPath)
        .on('end', () => {
          ffmpeg(inputPath)
            .screenshots({ timestamps: [1], filename: thumbName, folder: outputDir, size: '480x?' })
            .on('end', () => resolve({ lowRes: lowResPath, thumb: thumbPath, duration, totalSizeBytes: getDirectorySize(outputDir) }))
            .on('error', (e) => reject(new Error(`Thumb error: ${e.message}`)));
        })
        .on('error', (e) => reject(new Error(`Snack MP4 error: ${e.message}`)))
        .run();
    });
  });
}

// Initialize Worker — listens on 'video-processing' queue
const videoWorker = new Worker(
  'video-processing',
  async (job) => {
    // New payload from /api/upload/notify
    const { publicUrl, outputDir, fileName, poiId, type = 'dinner' } = job.data;
    // Legacy payload support (inputPath provided directly)
    let inputPath: string = job.data.inputPath ?? null;

    let tmpDownloaded = false;
    try {
      // ── Download step (only for new direct-upload flow) ──────────────────
      if (!inputPath && publicUrl) {
        console.log(`[VideoWorker] Downloading ${type} video for POI ${poiId}…`);
        const ext = (fileName ?? 'video').split('.').pop() ?? 'mp4';
        inputPath = await downloadToTemp(publicUrl, ext);
        tmpDownloaded = true;
      }

      if (!fs.existsSync(outputDir ?? '')) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let result: any;

      if (type === 'snack') {
        // ── ⚡ Snack: fast 480p MP4 only ─────────────────────────────────
        console.log(`[VideoWorker] ⚡ Snack pipeline: ${fileName} for POI ${poiId}`);
        result = await processSnack(inputPath, outputDir, fileName);
        console.log(`[VideoWorker] ✅ Snack done: ${(result.totalSizeBytes / 1024 / 1024).toFixed(1)}MB`);
      } else {
        // ── 🎬 Dinner: full HLS 720p + 480p + thumb ──────────────────────
        console.log(`[VideoWorker] 🎬 Dinner pipeline: ${fileName} for POI ${poiId}`);
        result = await processVideoToHLS(inputPath, outputDir, fileName);
        console.log(`[VideoWorker] ✅ Dinner done: HLS + 480p | ${(result.totalSizeBytes / 1024 / 1024).toFixed(1)}MB`);
      }

      return result;
    } catch (error: any) {
      console.error(`[VideoWorker] Job ${job.id} failed:`, error.message);
      throw error;
    } finally {
      // Clean up downloaded tmp file to avoid disk leak
      if (tmpDownloaded && inputPath && fs.existsSync(inputPath)) {
        fs.unlink(inputPath, () => {});
      }
    }
  },
  { connection: getConnection() as any }
);

videoWorker.on('completed', (job) => {
  const { type = 'dinner', fileName } = job.data;
  console.log(`[VideoWorker] ✅ Job ${job.id} complete (${type}) — ${fileName}`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`[VideoWorker] ❌ Job ${job?.id} failed: ${err.message}`);
});

