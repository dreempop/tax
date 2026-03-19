// app/gallery/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import {
  Plus, Trash2, Edit2, X, Save, ImageIcon, MapPin,
  Banknote, Calendar, Tag, LogIn, Upload, Search
} from 'lucide-react';

interface DonationRecord {
  id: string;
  user_id: string;
  title: string;
  organization: string;
  location: string;
  amount: number;
  date: string;
  category: string;
  image_url: string | null;
  note: string | null;
  created_at: string;
}

const CATEGORIES = ['การบริจาคทั่วไป', 'โรงพยาบาลรัฐ', 'การศึกษา', 'กีฬา', 'สาธารณกุศล', 'ศาสนา', 'อื่นๆ'];

const categoryColors: Record<string, string> = {
  'การบริจาคทั่วไป': 'bg-blue-100 text-blue-700',
  'โรงพยาบาลรัฐ': 'bg-red-100 text-red-700',
  'การศึกษา': 'bg-purple-100 text-purple-700',
  'กีฬา': 'bg-orange-100 text-orange-700',
  'สาธารณกุศล': 'bg-green-100 text-green-700',
  'ศาสนา': 'bg-amber-100 text-amber-700',
  'อื่นๆ': 'bg-gray-100 text-gray-700',
};

const emptyForm = {
  title: '',
  organization: '',
  location: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'การบริจาคทั่วไป',
  note: '',
};

export default function GalleryPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [records, setRecords] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('ทั้งหมด');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchRecords(user.id);
      else setLoading(false);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setAuthLoading(false);
      if (u) fetchRecords(u.id);
      else { setRecords([]); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchRecords = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('donation_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (rec: DonationRecord) => {
    setEditingId(rec.id);
    setForm({
      title: rec.title,
      organization: rec.organization,
      location: rec.location,
      amount: String(rec.amount),
      date: rec.date,
      category: rec.category,
      note: rec.note || '',
    });
    setImagePreview(rec.image_url);
    setImageFile(null);
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('donation-images').upload(path, imageFile);
    if (error) {
      // Bucket not found — fall back to base64 data URL stored directly
      if (error.message?.toLowerCase().includes('bucket') || (error as any).statusCode === 400) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string ?? null);
          reader.readAsDataURL(imageFile);
        });
      }
      console.error('Storage error:', error.message);
      return null;
    }
    const { data } = supabase.storage.from('donation-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!user || !form.title || !form.organization || !form.amount) return;
    setSaving(true);
    setSaveError(null);
    try {
      let imageUrl = imagePreview && !imageFile ? imagePreview : null;
      if (imageFile) imageUrl = await uploadImage();

      const payload = {
        user_id: user.id,
        title: form.title,
        organization: form.organization,
        location: form.location,
        amount: Number(form.amount),
        date: form.date,
        category: form.category,
        note: form.note || null,
        image_url: imageUrl,
      };

      if (editingId) {
        await supabase.from('donation_records').update(payload).eq('id', editingId);
      } else {
        await supabase.from('donation_records').insert(payload);
      }
      await fetchRecords(user.id);
      setModalOpen(false);
    } catch (err: any) {
      setSaveError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    await supabase.from('donation_records').delete().eq('id', id).eq('user_id', user.id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  };

  const filtered = records.filter((r) => {
    const matchCat = filterCat === 'ทั้งหมด' || r.category === filterCat;
    const matchSearch =
      !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalAmount = filtered.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero */}
      <section className="bg-gradient-to-b from-green-50 to-white pt-24 pb-12 text-center px-6">
        <span className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2 block">คลังข้อมูลส่วนตัว</span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight mb-4">
          บันทึกการบริจาคและลดหย่อนภาษี
        </h1>
        <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
          เก็บรูปหลักฐาน ข้อมูลการบริจาค และสถานที่ไว้ในที่เดียว พร้อมคำนวณยอดรวมที่ใช้ลดหย่อนได้
        </p>
      </section>

      <section className="py-8 px-6 pb-20">
        <div className="container mx-auto max-w-6xl">
          {authLoading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
              <LogIn className="w-16 h-16 opacity-40" />
              <p className="text-xl font-medium">เข้าสู่ระบบเพื่อบันทึกข้อมูลการบริจาคของคุณ</p>
            </div>
          ) : (
            <>
              {/* Action bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ องค์กร หรือสถานที่..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                  />
                </div>
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors shadow"
                >
                  <Plus className="w-5 h-5" /> เพิ่มรายการ
                </button>
              </div>

              {/* Category filter */}
              <div className="flex gap-2 flex-wrap mb-8">
                {['ทั้งหมด', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                      filterCat === cat
                        ? 'bg-green-600 text-white shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-extrabold text-green-700">{filtered.length}</p>
                  <p className="text-sm text-gray-600 mt-1">รายการทั้งหมด</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center col-span-2 md:col-span-1">
                  <p className="text-2xl font-extrabold text-blue-700">{totalAmount.toLocaleString('th-TH')}</p>
                  <p className="text-sm text-gray-600 mt-1">ยอดบริจาครวม (บาท)</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-extrabold text-amber-700">
                    {new Set(filtered.map((r) => r.category)).size}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">ประเภท</p>
                </div>
              </div>

              {/* Records Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-3xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-100" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
                  <ImageIcon className="w-16 h-16 opacity-40" />
                  <p className="text-lg font-medium">ยังไม่มีรายการ — กดเพิ่มรายการเพื่อเริ่มบันทึก</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((rec) => (
                    <div key={rec.id} className="rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 bg-gray-50">
                        {rec.image_url ? (
                          <Image src={rec.image_url} alt={rec.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300">
                            <ImageIcon className="w-12 h-12" />
                          </div>
                        )}
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[rec.category] ?? 'bg-gray-100 text-gray-600'}`}>
                          {rec.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">{rec.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{rec.organization}</p>

                        <div className="space-y-1.5 text-sm text-gray-600 flex-grow">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="line-clamp-1">{rec.location || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{new Date(rec.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-green-500 shrink-0" />
                            <span className="font-semibold text-green-700">{rec.amount.toLocaleString('th-TH')} บาท</span>
                          </div>
                          {rec.note && (
                            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{rec.note}</p>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => openEdit(rec)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id)}
                            disabled={deletingId === rec.id}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-100 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image upload */}
              <div
                className="relative h-44 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors overflow-hidden"
                onClick={() => fileRef.current?.click()}
              >
                {imagePreview ? (
                  <Image src={imagePreview} alt="preview" fill sizes="100vw" className="object-cover rounded-2xl" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 gap-2">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">คลิกเพื่ออัปโหลดรูปหลักฐาน</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

              {/* Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรายการ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="เช่น บริจาคโรงพยาบาลรามา"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อองค์กร / หน่วยงาน <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="เช่น โรงพยาบาลรามาธิบดี"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><MapPin className="w-4 h-4 inline mr-1" />สถานที่ทำการ</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="เช่น กรุงเทพมหานคร"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><Banknote className="w-4 h-4 inline mr-1" />จำนวนเงิน (บาท) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0"
                    min={0}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><Calendar className="w-4 h-4 inline mr-1" />วันที่</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><Tag className="w-4 h-4 inline mr-1" />ประเภท</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  {CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  placeholder="บันทึกเพิ่มเติม..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>
            </div>

            {saveError && (
              <p className="px-6 pb-2 text-sm text-red-500">{saveError}</p>
            )}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.organization || !form.amount}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
