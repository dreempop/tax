// app/components/ArticleCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    image_url: string;
    category: string;
    author_name: string;
    published_at: string;
  };
  priority?: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop';

function isValidImageUrl(url: string) {
  if (!url) return false;
  try {
    const { pathname } = new URL(url);
    return /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/i.test(pathname) || 
           url.includes('supabase') ||
           url.includes('unsplash') ||
           url.includes('placeholder') ||
           url.includes('googleusercontent');
  } catch {
    return false;
  }
}

const ArticleCard = ({ article, priority = false }: ArticleCardProps) => {
  const formattedDate = new Date(article.published_at).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 w-full">
        <Image
          src={isValidImageUrl(article.image_url) ? article.image_url : FALLBACK_IMAGE}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-300 hover:scale-105"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        <div className="absolute top-4 left-4">
          <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <div className="flex items-center mr-4">
            <User className="w-4 h-4 mr-1" />
            <span>{article.author_name}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Read More Button */}
        <Link
          href={`/articles/${article.slug}`}
          className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center group"
        >
          อ่านต่อ
          <svg
            className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;