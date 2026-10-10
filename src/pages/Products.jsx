import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import {
  Filter,
  SlidersHorizontal,
  Search,
  Grid3X3,
  List,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Star,
} from 'lucide-react';

import { formatINR } from '../utils/format';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minRating, setMinRating] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const query = searchParams.get('search') || '';
    setSelectedCategory(cat);
    setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    async function init() {
      try {
        const catList = await productService.getCategories();
        setCategories(catList);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const data = await productService.getProducts({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery,
          limit: 60,
        });
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory, searchQuery]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val) {
      newParams.delete('search');
    } else {
      newParams.set('search', val);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('default');
    setMaxPrice(200000);
    setMinRating(0);
    setSearchParams({});
  };

  const filteredProducts = products
    .filter((p) => p.price <= maxPrice)
    .filter((p) => (minRating > 0 ? (p.rating || 0) >= minRating : true))
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return (a.title || a.name || '').localeCompare(b.title || b.name || '');
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 border border-indigo-100/90 p-8 sm:p-12 overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Catalog & Collections
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {selectedCategory === 'all'
              ? 'Complete Collection'
              : `${selectedCategory.toUpperCase()} DROP`}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Discover our collection of curated pieces fetched directly from your live store database.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" /> Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Keyword Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Filter titles..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pl-9 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Departments
            </label>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All Departments
              </button>
              {categories.map((cat) => {
                const catName = typeof cat === 'object' ? cat.name : cat;
                const catKey = typeof cat === 'object' ? cat.id : cat;
                const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
                return (
                  <button
                    key={catKey}
                    onClick={() => handleCategorySelect(catName)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {catName.replace(/-/g, ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Max Price</span>
              <span className="font-mono text-indigo-600 font-bold">{formatINR(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="200000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>₹500</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Minimum Rating
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 4, 4.5, 4.8].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`p-1.5 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                    minRating === rating
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {rating === 0 ? 'Any' : `${rating}★`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Showing <span className="text-slate-900 font-bold">{filteredProducts.length}</span> pieces
              {selectedCategory !== 'all' && (
                <> in <span className="text-indigo-600 font-semibold uppercase">{selectedCategory}</span></>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="default">Featured / Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>

              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-slate-200 p-4 animate-pulse space-y-4 shadow-xs">
                  <div className="aspect-square bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No pieces match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try expanding your price range, clearing the search query, or selecting another department.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-5 hover:border-indigo-400 hover:shadow-md transition-all"
                >
                  <img
                    src={p.thumbnail || p.images?.[0] || p.image}
                    alt={p.title || p.name}
                    className="w-36 h-36 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
                      <span className="uppercase tracking-wider text-indigo-600 font-bold">{p.category || 'Collection'}</span>
                      <span>•</span>
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" /> {p.rating ? Number(p.rating).toFixed(1) : '4.8'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{p.title || p.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    <div className="text-lg font-bold text-slate-900 font-mono">
                      {formatINR(p.price)}
                    </div>
                  </div>
                  <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setQuickViewProduct(p)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
