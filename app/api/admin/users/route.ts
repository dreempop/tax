// app/api/admin/users/route.ts
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
  // Check admin via app_metadata first (no DB query needed)
  const isAdminMeta = user.app_metadata?.role === 'admin';
  if (isAdminMeta) return { adminUser: user, supabase };
  // Fallback: check profiles table — tolerate missing 'role' column
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return null;
  return { adminUser: user, supabase };
}

// GET — list all users from profiles table
export async function GET(request: Request) {
  const ctx = await verifyAdmin(request);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { supabase } = ctx;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[admin/users GET]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST — create a new user profile entry (admin-created)
export async function POST(request: Request) {
  const ctx = await verifyAdmin(request);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, username, full_name, website, role, is_approved } = body;

  if (!id) return NextResponse.json({ error: 'User id is required' }, { status: 400 });

  const { supabase } = ctx;
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id, username, full_name, website, role: role ?? 'user', is_approved: !!is_approved, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
