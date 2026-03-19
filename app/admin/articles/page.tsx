// app/admin/articles/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import {
  Plus, Search, Pencil, Trash2, Loader2, Eye, EyeOff, AlertTriangle, CheckCircle2,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  author_name: string;
  published_at: string;
  is_published: boolean;
  excerpt: string;
  image_url: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [token, setToken] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const router = useRouter();

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setToken(session.access_token);
      fetchArticles(session.access_token);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchArticles = async (tk: string) => {
    setLoading(true);
    const res = await fetch('/api/admin/articles', {
      headers: { Authorization: `Bearer ${tk}` },
    });
    if (!res.ok) {
      showToast('error', 'ไม่สามารถโหลดข้อมูลบทความได้');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setArticles(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? articles.filter(a => a.title.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q)) : articles
    );
  }, [search, articles]);

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบบทความนี้?')) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    if (res.ok) {
      showToast('success', 'ลบบทความเรียบร้อยแล้ว');
      setArticles(prev => prev.filter(a => a.id !== id));
    } else {
      showToast('error', 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleTogglePublish = async (article: Article) => {
    const res = await fetch(`/api/admin/articles/${article.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...article, is_published: !article.is_published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
      showToast('success', updated.is_published ? 'เผยแพร่แล้ว' : 'ซ่อนจากสาธารณะแล้ว');
    } else {
      showToast('error', 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-green-900/90 border border-green-700 text-green-300'
            : 'bg-red-900/90 border border-red-700 text-red-300'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4" />
            : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">จัดการบทความ</h1>
          <p className="text-sm text-gray-500 mt-0.5">{articles.length} บทความทั้งหมด</p>
        </div>
        <button
          onClick={() => router.push('/admin/articles/new')}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          เพิ่มบทความ
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="ค้นหาชื่อบทความหรือหมวดหมู่..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">ไม่พบบทความ</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">ชื่อบทความ</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">หมวดหมู่</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">ผู้เขียน</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">วันที่</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">สถานะ</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article, i) => (
                <tr
                  key={article.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium line-clamp-1 max-w-xs">{article.title}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{article.slug}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                      {article.category || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 hidden lg:table-cell">
                    {article.author_name || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs hidden lg:table-cell">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('th-TH')
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleTogglePublish(article)}
                      title={article.is_published ? 'ซ่อน' : 'เผยแพร่'}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        article.is_published
                          ? 'bg-green-900/40 text-green-400 hover:bg-green-900/70'
                          : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                      }`}
                    >
                      {article.is_published
                        ? <><Eye className="w-3 h-3" />เผยแพร่</>
                        : <><EyeOff className="w-3 h-3" />ฉบับร่าง</>}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                        className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        disabled={deletingId === article.id}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                        title="ลบ"
                      >
                        {deletingId === article.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
