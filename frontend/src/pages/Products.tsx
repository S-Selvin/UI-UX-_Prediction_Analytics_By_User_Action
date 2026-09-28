import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { trackEvent } from '../analytics/core';

export function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim().length > 2) {
      trackEvent('search', window.location.pathname, undefined, { search_query: val });
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedCategory(val);
    trackEvent('click', window.location.pathname, `Filter: ${val}`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">All Products</h1>
        <p className="text-lg text-slate-500">Discover our full range of premium products.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-64 space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-900 mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
              <Filter className="h-4 w-4" />
              Categories
            </div>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={handleCategoryChange}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={`text-sm ${selectedCategory === category ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
              <p className="text-slate-500 mb-2">No products found matching your criteria.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
