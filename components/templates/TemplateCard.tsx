'use client';

import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  thumbnail: string | null;
  tags: string[];
  imports: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  author: {
    name: string | null;
    email: string;
  };
  _count: {
    favorites: number;
  };
}

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const CATEGORY_ICONS: Record<string, string> = {
  'social-media': '📱',
  'email': '📧',
  'content': '📝',
  'ecommerce': '🛒',
  'support': '💬',
  'data': '📊',
  'marketing': '📈',
  'productivity': '⚡'
};

export default function TemplateCard({ template, onClick }: TemplateCardProps) {
  const [favorited, setFavorited] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/templates/${template.id}/favorite`, {
        method: 'POST'
      });
      const result = await response.json();
      setFavorited(result.favorited);
    } catch (error) {
      console.error('Error favoriting template:', error);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
    >
      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {CATEGORY_ICONS[template.category] || '📋'}
          </div>
        )}
        {template.featured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
            ⭐ Featured
          </div>
        )}
        <button
          onClick={handleFavorite}
          className={`absolute top-2 left-2 p-2 rounded-full ${
            favorited ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
          } hover:bg-white transition-colors`}
        >
          {favorited ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Difficulty */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            {CATEGORY_ICONS[template.category]} {template.category.replace('-', ' ')}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${DIFFICULTY_COLORS[template.difficulty]}`}>
            {template.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">
          {template.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
            >
              #{tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>⬇️ {template.imports || 0}</span>
            <span>⭐ {(template.rating || 0).toFixed(1)} ({template.ratingCount || 0})</span>
            <span>🤍 {template._count?.favorites || 0}</span>
          </div>
          <span className="text-gray-400">
            by {template.author?.name || template.author?.email?.split('@')[0] || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}
