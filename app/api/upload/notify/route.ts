import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getVideoQueue } from '@/lib/queue/client';
import os from 'os';
import path from 'path';

/**
 * POST /api/upload/notify
 *
 * Called by the browser AFTER the direct Supabase upload completes.
 * This endpoint:
 *   1. Updates poi.videoUrls with the new public URL (immediate)
 *   2. Enqueues an async BullMQ job for HLS/MP4 transcoding
 *
 * Body:
 * {
 *   poiId: string,
 *   publicUrl: string,     // Supabase public URL of the raw upload
 *   storagePath: string,   // Internal Supabase path (for worker download)
 *   type: 'snack' | 'dinner',  // Duration-based classification
 *   duration: number,      // seconds (detected by browser via <video>.duration)
 *   fileName: string,
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { poiId, publicUrl, storagePath, type, duration, fileName } = body;

    if (!poiId || !publicUrl) {
      return NextResponse.json({ error: 'poiId and publicUrl are required' }, { status: 400 });
    }

    // 1. Immediately add raw video URL to POI so it's accessible right away
    const poi = await prisma.poi.findUnique({ where: { id: poiId }, select: { videoUrls: true } });
    if (!poi) {
      return NextResponse.json({ error: 'POI not found' }, { status: 404 });
    }

    const currentUrls: string[] = (poi.videoUrls as string[]) ?? [];
    const updatedUrls = [...currentUrls, publicUrl].slice(0, 3); // Max 3 videos

    await prisma.poi.update({
      where: { id: poiId },
      data: { videoUrls: updatedUrls },
    });

    // 2. Enqueue video processing job (async — does NOT block this response)
    try {
      const videoQueue = getVideoQueue();
      const outputDir = path.join(os.tmpdir(), 'geocontent-hls', poiId);
      const safeFileName = (fileName ?? 'video').replace(/[^a-z0-9_-]/gi, '_');

      await videoQueue.add('transcode', {
        poiId,
        publicUrl,          // Worker downloads from here
        storagePath,
        outputDir,
        fileName: safeFileName,
        type: type ?? 'dinner',
        duration: duration ?? 0,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 20,
      });

      console.log(`[notify] Enqueued ${type ?? 'dinner'} job for POI ${poiId} — ${fileName}`);
    } catch (queueErr: any) {
      // Queue failure is non-fatal: raw URL is already saved
      console.warn('[notify] BullMQ enqueue failed (non-fatal):', queueErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `URL saved. Transcoding job enqueued as ${type ?? 'dinner'}.`,
    });
  } catch (err: any) {
    console.error('[notify] Unexpected error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
