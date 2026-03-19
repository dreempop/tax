// app/admin/stats/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import {
  Users, FileText, Eye, EyeOff, CheckCircle2, Clock,
  Loader2, BarChart2, RefreshCw, AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';

interface Stats {
  users: { total: number; approved: number; pending: number };
  articles: { total: number; published: number; draft: number };
  categories: { name: string; count: number }[];
  monthly: { month: string; count: number }[];
  recentArticles: { id: string; title: string; published_at: string; is_published: boolean; category: string }[];
  recentUsers: { id: string; full_name: string | null; username: string | null; updated_at: string; is_approved: boolean | null }[];
}

const ORANGE = '#f97316';
const GRAY = '#374151';
const PIE_COLORS_ARTICLE = [ORANGE, GRAY];
const PIE_COLORS_USER = [ORANGE, GRAY];

const TooltipStyle = {
  contentStyle: { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#f97316' },
};

function StatCard({ label, value, sub, icon, accent }: {
  label: string; value: number; sub?: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start justify-between hover:border-${accent}-500/40 transition-colors`}>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className="text-gray-600">{icon}</div>
    </div>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const fetchStats = async (tk: string) => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${tk}` },
    });
    if (!res.ok) { setError('ไม่สามารถโหลดข้อมูลสถิติได้'); setLoading(false); return; }
    setStats(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setToken(session.access_token);
      fetchStats(session.access_token);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-32">
      <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
    </div>
  );

  if (error || !stats) return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-gray-400">{error || 'ไม่พบข้อมูล'}</p>
      <button onClick={() => fetchStats(token)} className="mt-4 flex items-center gap-2 mx-auto text-sm text-orange-400 hover:text-orange-300">
        <RefreshCw className="w-4 h-4" /> ลองใหม่
      </button>
    </div>
  );

  const articlePieData = [
    { name: 'เผยแพร่', value: stats.articles.published },
    { name: 'ฉบับร่าง', value: stats.articles.draft },
  ];
  const userPieData = [
    { name: 'อนุมัติแล้ว', value: stats.users.approved },
    { name: 'รออนุมัติ', value: stats.users.pending },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">สถิติการใช้งาน</h1>
          <p className="text-sm text-gray-500 mt-0.5">ภาพรวมระบบ C-Advisor</p>
        </div>
        <button onClick={() => fetchStats(token)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> รีเฟรช
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="ผู้ใช้ทั้งหมด"   value={stats.users.total}       sub={`อนุมัติแล้ว ${stats.users.approved} คน`}           icon={<Users className="w-6 h-6" />}   accent="blue" />
        <StatCard label="รออนุมัติ"        value={stats.users.pending}     sub="บัญชีที่ยังไม่อนุมัติ"                               icon={<Clock className="w-6 h-6" />}   accent="yellow" />
        <StatCard label="บทความทั้งหมด"    value={stats.articles.total}    sub={`เผยแพร่แล้ว ${stats.articles.published} บทความ`}   icon={<FileText className="w-6 h-6" />} accent="green" />
        <StatCard label="ฉบับร่าง"         value={stats.articles.draft}    sub="ยังไม่เผยแพร่"                                       icon={<EyeOff className="w-6 h-6" />}  accent="gray" />
      </div>

      {/* Line chart — monthly articles */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-white">บทความรายเดือน (6 เดือนล่าสุด)</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.monthly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TooltipStyle} formatter={(v) => [v, 'บทความ']} />
            <Line type="monotone" dataKey="count" stroke={ORANGE} strokeWidth={2} dot={{ fill: ORANGE, r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart + Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart — categories */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white">บทความตามหมวดหมู่</h2>
          </div>
          {stats.categories.length === 0 ? (
            <p className="text-gray-600 text-sm">ไม่มีข้อมูล</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.categories} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TooltipStyle} formatter={(v) => [v, 'บทความ']} />
                <Bar dataKey="count" fill={ORANGE} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie charts */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">สัดส่วนบทความ</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={articlePieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                  {articlePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS_ARTICLE[i]} />)}
                </Pie>
                <Tooltip {...TooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">สัดส่วนผู้ใช้</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={userPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                  {userPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS_USER[i]} />)}
                </Pie>
                <Tooltip {...TooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white">บทความล่าสุด</h2>
          </div>
          {stats.recentArticles.length === 0 ? (
            <p className="text-gray-600 text-sm">ไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {stats.recentArticles.map(a => (
                <div key={a.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white line-clamp-1">{a.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{a.category} · {new Date(a.published_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-0.5 ${a.is_published ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    {a.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {a.is_published ? 'เผยแพร่' : 'ร่าง'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white">ผู้ใช้ล่าสุด</h2>
          </div>
          {stats.recentUsers.length === 0 ? (
            <p className="text-gray-600 text-sm">ไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white line-clamp-1">
                      {u.full_name || u.username || <span className="text-gray-600">ไม่ระบุชื่อ</span>}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{new Date(u.updated_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${u.is_approved ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {u.is_approved ? 'อนุมัติ' : 'รอ'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}