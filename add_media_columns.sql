-- Add new columns for rich media support
ALTER TABLE public.legends 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Comment on columns for clarity
COMMENT ON COLUMN public.legends.audio_url IS 'URL to the uploaded audio narration file';
COMMENT ON COLUMN public.legends.video_url IS 'URL to a video (YouTube/Vimeo or uploaded)';
COMMENT ON COLUMN public.legends.hero_image_url IS 'URL to the wide/landscape image for details header (16:9)';
