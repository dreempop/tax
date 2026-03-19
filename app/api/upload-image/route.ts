import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'documents';

async function ensureBucket() {
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10485760, // 10 MB
  });
  if (error && !error.message.toLowerCase().includes('already exists')) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: missing env vars' }, { status: 500 });
    }

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const userId = formData.get('userId') as string | null;

    if (!files.length || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    await ensureBucket();

    const uploaded: { fileName: string; publicUrl: string; originalName: string }[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(fileName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: `Upload error: ${uploadError.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
      uploaded.push({ fileName, publicUrl, originalName: file.name });
    }

    return NextResponse.json({ uploaded });
  } catch (error: any) {
    console.error('Upload image error:', error);
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: missing env vars' }, { status: 500 });
    }

    const { fileName } = await request.json();
    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid fileName' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([fileName]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}
