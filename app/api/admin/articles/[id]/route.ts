// app/api/admin/articles/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function verifyAdmin(request: Request) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const isAdminMeta = user.app_metadata?.role === 'admin';
  if (isAdminMeta) return { user, supabase };
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return { user, supabase };
}

// GET — single article by id
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await verifyAdmin(request);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { supabase } = ctx;
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PUT — update article
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await verifyAdmin(request);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { title, slug, excerpt, content, image_url, category, author_name, is_published } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 });
  }

  const { supabase } = ctx;
  const { data, error } = await supabase
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
  const ctx = await verifyAdmin(request);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { supabase } = ctx;
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
