import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

/**
  * GET /api/upload/signed-url?fileName=video.mp4&bucket=geocontent&contentType=video/mp4
  *
  * Returns a short-lived signed upload URL so the browser can PUT
  * the file directly to Supabase Storage — bypassing Next.js completely.
  *
  * Next.js never receives the file bytes. Memory footprint: ~0.
  */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName') ?? 'upload';
    const bucket = searchParams.get('bucket') ?? 'geocontent';

    // Generate a unique storage path to avoid name collisions
    const ext = fileName.split('.').pop() ?? 'bin';
    const storagePath = `${uuidv4()}.${ext}`;

    const supabase = createClient(await cookies());

    // Request a signed upload URL (expires in 5 minutes)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error('[signed-url] Supabase error:', error?.message);
      return NextResponse.json({ error: "S'ha produït un error al processar la sol·licitud" }, { status: 500 });
    }

    // Also pre-calculate the public URL (will be valid once uploaded)
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      signedUrl: data.signedUrl,  // Browser PUTs here directly
      token: data.token,
      storagePath,                // Used in /api/upload/notify
      publicUrl,                  // Final URL stored in DB
    });
  } catch (err: any) {
    console.error('[signed-url] Unexpected error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
