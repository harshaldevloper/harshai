'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getAllTemplates, getCategories, searchTemplates, getTemplatesByCategory } from '@/lib/templates';
import TemplateCard from '@/components/templates/TemplateCard';

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const allTemplates = getAllTemplates();
  const categories = getCategories();
  
  // Filter templates
  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory === 'all'
    ? allTemplates
    : getTemplatesByCategory(selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3e] to-[#0f0f23]">
      {/* Navigation */}
      <nav className="px-8 py-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/harshai-logo.png" alt="HarshAI" className="w-12 h-12" />
            <span className="text-3xl font-bold gradient-text">HarshAI</span>
          </Link>
          <div className="flex gap-6">
            <Link href="/builder" className="text-gray-300 hover:text-white transition-colors">
              Builder
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/use-cases" className="text-gray-300 hover:text-white transition-colors">
              Use Cases
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-black mb-6 gradient-text">
            Workflow Templates
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Start with pre-built automations. Customize to fit your needs.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {category.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <p className="text-2xl text-gray-400">No templates found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 mt-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>© 2026 HarshAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
