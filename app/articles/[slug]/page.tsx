'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import { Calendar, User, ArrowLeft } from 'lucide-react';

/* ──────────────────────────────────────────────
   Structured-JSON renderer
   Handles the schema:
   { document:{...}, sections:[{ title, content, subsections:[{ title, content, items:[{type,text}] }] }] }
─────────────────────────────────────────────── */
interface JsonItem   { item_id?: string; type: string; text: string }
interface JsonSub    { subsection_id?: string; title: string; content?: string; items?: JsonItem[] }
interface JsonSection{ section_id?: string; section_order?: number; title: string; content?: string; subsections?: JsonSub[] }
interface JsonDoc    { document?: { title?: string; description?: string }; sections?: JsonSection[] }

function StructuredContent({ raw }: { raw: string }) {
  let parsed: JsonDoc | null = null;
  try { parsed = JSON.parse(raw); } catch { /* not JSON */ }

  if (!parsed || !parsed.sections) {
    // Fallback: plain markdown
    return (
      <div className="article-body">
        <ReactMarkdown>{raw.replace(/\\n/g, '\n')}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="article-body space-y-10">
      {parsed.sections.map((sec, si) => (
        <section key={sec.section_id ?? si}>
          <h2>{sec.title}</h2>
          {sec.content && <p>{sec.content}</p>}

          {sec.subsections?.map((sub, subi) => (
            <div key={sub.subsection_id ?? subi} className="mt-6">
              <h3>{sub.title}</h3>
              {sub.content && <p>{sub.content}</p>}

              {sub.items && sub.items.length > 0 && (
                <ul>
                  {sub.items.map((item, ii) => (
                    <li key={item.item_id ?? ii}>{item.text}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

import Footer from '@/app/components/Footer';
import { supabase } from '@/app/lib/supabase';


interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  category: string;
  author_name: string;
  published_at: string;
}

export default function ArticleDetailPage() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const params = useParams();

  useEffect(() => {
    if (params.slug) fetchArticle(params.slug as string);
  }, [params.slug]);

  const fetchArticle = async (slug: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      console.error('Error fetching article:', error);
      setNotFound(true);
    } else {
      setArticle(data);
    }
    setLoading(false);
  };

  const formattedDate = article
    ? new Date(article.published_at).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดบทความ...</p>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
  
        <div className="grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบบทความนี้</h1>
            <p className="text-gray-600 mb-6">
              บทความที่คุณค้นหาอาจถูกลบไปแล้วหรือไม่มีอยู่ในระบบ
            </p>
            <Link
              href="/articles"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              กลับไปหน้าบทความ
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <main className="grow">
        {/* Hero Image Section */}
        <div className="relative w-full h-64 sm:h-80 md:h-[460px] overflow-hidden bg-gray-900">
          <img
            src={article.image_url || 'https://via.placeholder.com/800x400.png?text=Tax+Article'}
            alt={article.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Back button over image */}
          <div className="absolute top-6 left-6">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              กลับไปหน้าบทความ
            </Link>
          </div>
          {/* Title over image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="max-w-3xl mx-auto">
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                {article.category}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
                {article.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          {/* Author / Date */}
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-gray-100 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium text-gray-700">{article.author_name}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Content */}
          <StructuredContent raw={article.content} />

          {/* Back button bottom */}
          <div className="mt-14 pt-8 border-t border-gray-100">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full font-semibold text-sm hover:bg-green-700 transition-all group shadow-md shadow-green-200"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              กลับไปหน้าบทความ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
