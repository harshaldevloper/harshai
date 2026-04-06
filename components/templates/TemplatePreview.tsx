'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  thumbnail: string | null;
  tags: string[];
  nodes: any[];
  edges: any[];
  imports: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  variables_: any[];
  _count: {
    favorites: number;
  };
}

interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
}

export default function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleImport = async () => {
    setImporting(true);
    try {
      const response = await fetch(`/api/templates/${template.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();

      if (response.ok) {
        router.push(`/workflows/${result.workflow.id}/edit`);
      } else {
        alert(result.error || 'Failed to import template');
      }
    } catch (error) {
      console.error('Error importing template:', error);
      alert('Failed to import template');
    } finally {
      setImporting(false);
    }
  };

  const handleRate = async (value: number) => {
    try {
      await fetch(`/api/templates/${template.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value })
      });
      setRating(value);
    } catch (error) {
      console.error('Error rating template:', error);
    }
  };

  const nodeCount = template.nodes?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {template.category}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                {template.difficulty}
              </span>
              <span>⬇️ {template.imports} imports</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          {template.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{template.description}</p>
            </div>
          )}

          {/* Author */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Author</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(template.author.name || template.author.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{template.author.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">{template.author.email}</p>
              </div>
            </div>
          </div>

          {/* Workflow Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Workflow Overview</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{nodeCount}</div>
                  <div className="text-sm text-gray-600">Nodes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{template.edges?.length || 0}</div>
                  <div className="text-sm text-gray-600">Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{template.variables_?.length || 0}</div>
                  <div className="text-sm text-gray-600">Variables</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Rate this template</h3>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  {(hoverRating || rating) >= star ? '⭐' : '☆'}
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {template.rating.toFixed(1)} ({template.ratingCount} ratings)
              </span>
            </div>
          </div>

          {/* Variables (if any) */}
          {template.variables_ && template.variables_.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Configuration Required</h3>
              <div className="space-y-2">
                {template.variables_.map((variable: any) => (
                  <div key={variable.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{variable.label}</p>
                      <p className="text-sm text-gray-500">{variable.name} ({variable.type})</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${variable.required ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {variable.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : 'Use Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
