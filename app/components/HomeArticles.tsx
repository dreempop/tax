'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ArticleCard from './ArticleCard';
import { supabase } from '@/app/lib/supabase';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  category: string;
  author_name: string;
  published_at: string;
}

export default function HomeArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setArticles(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-gray-50/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-gray-50/50">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2 block">บทความล่าสุด</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">คลังความรู้ภาษี</h2>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors group shrink-0"
          >
            ดูบทความทั้งหมด
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} priority={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
