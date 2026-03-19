// app/articles/page.tsx
'use client';

import { useState, useEffect } from 'react';


import Footer from '../components/Footer';
import ArticleCard from '../components/ArticleCard';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

const categories = ['ทั้งหมด', 'ภาษีลดหย่น', 'กองทุน', 'ประกันสังคม', 'เคล็ดลับ'];

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchTerm, setSearchTerm] = useState('');

  // ดึงข้อมูลบทความจาก Supabase
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        setArticles(data || []);
        setFilteredArticles(data || []);
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

  // กรองบทความตามหมวดหมู่และคำค้นหา
  useEffect(() => {
    let filtered = articles;

    // กรองตามหมวดหมู่
    if (selectedCategory !== 'ทั้งหมด') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // กรองตามคำค้นหา
    if (searchTerm) {
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  }, [articles, selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            บทความด้านภาษี
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ความรู้และคำแนะนำเพื่อช่วยให้คุณเข้าใจและจัดการเรื่องภาษีได้อย่างถูกต้องและง่ายดาย
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-1/2 mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาบทความ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดบทความ...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">ไม่พบบทความที่คุณกำลังค้นหา</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}