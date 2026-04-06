'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  visibility: string;
  thumbnail: string | null;
  tags: string[];
  imports: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  createdAt: string;
  _count: {
    favorites: number;
  };
}

export default function MyTemplates() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates/my-templates');
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId));
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const handleVisibilityToggle = async (templateId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
    
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility })
      });

      if (response.ok) {
        setTemplates(templates.map(t => 
          t.id === templateId ? { ...t, visibility: newVisibility } : t
        ));
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Failed to update visibility');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Templates</h1>
          <p className="text-gray-600">
            Manage your created templates
          </p>
        </div>
        <button
          onClick={() => router.push('/templates/marketplace')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Marketplace
        </button>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">You haven't created any templates yet</p>
          <button
            onClick={() => router.push('/workflows')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{template.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      template.visibility === 'public' 
                        ? 'bg-green-100 text-green-800' 
                        : template.visibility === 'unlisted'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.visibility}
                    </span>
                    {template.featured && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📁 {template.category}</span>
                    <span>📊 {template.difficulty}</span>
                    <span>⬇️ {template.imports} imports</span>
                    <span>⭐ {template.rating.toFixed(1)} ({template.ratingCount})</span>
                    <span>🤍 {template._count.favorites}</span>
                    <span>📅 {new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleVisibilityToggle(template.id, template.visibility)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    title="Toggle visibility"
                  >
                    {template.visibility === 'public' ? '🔒 Make Private' : '🌍 Make Public'}
                  </button>
                  <button
                    onClick={() => router.push(`/templates/${template.id}/edit`)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
