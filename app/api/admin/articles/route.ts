// app/api/admin/articles/route.ts
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

// GET — all articles (including unpublished)
export async function GET(request: Request) {
  const ok = await verifyAdmin(request);
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, category, author_name, published_at, is_published, excerpt, image_url')
    .order('published_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — create new article
export async function POST(request: Request) {
  const ok = await verifyAdmin(request);
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, slug, excerpt, content, image_url, category, author_name, is_published } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert([{ title, slug, excerpt, content, image_url, category, author_name, is_published: !!is_published, published_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
