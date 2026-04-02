'use client';

import { WorkflowTemplate } from '@/lib/templates';
import { useRouter } from 'next/navigation';

interface TemplateCardProps {
  template: WorkflowTemplate;
}

const categoryIcons: Record<string, string> = {
  'social-media': '📱',
  'email': '📧',
  'content': '📝',
  'ecommerce': '🛒',
  'support': '💬',
  'data': '📊'
};

const difficultyColors: Record<string, string> = {
  'beginner': 'text-green-400 bg-green-400/10',
  'intermediate': 'text-yellow-400 bg-yellow-400/10',
  'advanced': 'text-red-400 bg-red-400/10'
};

export default function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();

  const handleUseTemplate = () => {
    // Store template ID in localStorage for builder to pick up
    localStorage.setItem('template-to-import', template.id);
    router.push('/builder');
  };

  return (
    <div className="glass p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">
          {categoryIcons[template.category] || '🚀'}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${difficultyColors[template.difficulty]}`}>
          {template.difficulty}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">
        {template.name}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-white/5 rounded-md text-xs text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
        <span>⏱️ {template.estimatedTime}</span>
        <span className="capitalize">{template.category.replace('-', ' ')}</span>
      </div>

      {/* Action Button */}
      <button
        onClick={handleUseTemplate}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-bold hover:scale-105 transition-transform"
      >
        Use This Template →
      </button>
    </div>
  );
}
