// app/api/admin/articles/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin(request: Request) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  const token = auth.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return false;
  const isAdminMeta = user.app_metadata?.role === 'admin';
  if (isAdminMeta) return true;
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin';
}

// GET — single article by id
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ok = await verifyAdmin(request);
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabaseAdmin.from('articles').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PUT — update article
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ok = await verifyAdmin(request);
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { title, slug, excerpt, content, image_url, category, author_name, is_published } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .update({ title, slug, excerpt, content, image_url, category, author_name, is_published: !!is_published })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — remove article
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ok = await verifyAdmin(request);
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
