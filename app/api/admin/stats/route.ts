// app/api/admin/stats/route.ts
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

export async function GET(request: Request) {
  const ctx = await verifyAdmin(request);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { supabase } = ctx;

  // Run all counts in parallel
  const [
    { count: totalUsers },
    { count: approvedUsers },
    { count: totalArticles },
    { count: publishedArticles },
    { data: recentArticles },
    { data: recentUsers },
    { data: articlesByCategory },
    { data: monthlyArticles },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('articles')
      .select('id, title, published_at, is_published, category')
      .order('published_at', { ascending: false })
      .limit(5),
    supabase.from('profiles')
      .select('id, full_name, username, updated_at, is_approved')
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase.from('articles')
      .select('category')
      .eq('is_published', true),
    // monthly articles for the last 6 months
    supabase.from('articles')
      .select('published_at, is_published')
      .gte('published_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // Count articles per category
  const catMap: Record<string, number> = {};
  for (const row of articlesByCategory ?? []) {
    const cat = row.category || 'ไม่ระบุ';
    catMap[cat] = (catMap[cat] ?? 0) + 1;
  }
  const categories = Object.entries(catMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Build monthly data (last 6 months)
  const monthlyMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap[key] = 0;
  }
  for (const row of (monthlyArticles as any[] ?? [])) {
    if (!row.published_at) continue;
    const d = new Date(row.published_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in monthlyMap) monthlyMap[key]++;
  }
  const monthly = Object.entries(monthlyMap).map(([month, count]) => ({
    month: new Date(month + '-01').toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
    count,
  }));

  return NextResponse.json({
    users: {
      total: totalUsers ?? 0,
      approved: approvedUsers ?? 0,
      pending: (totalUsers ?? 0) - (approvedUsers ?? 0),
    },
    articles: {
      total: totalArticles ?? 0,
      published: publishedArticles ?? 0,
      draft: (totalArticles ?? 0) - (publishedArticles ?? 0),
    },
    categories,
    monthly,
    recentArticles: recentArticles ?? [],
    recentUsers: recentUsers ?? [],
  });
}
