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

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [minRating, setMinRating] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const query = searchParams.get('search') || '';
    setSelectedCategory(cat);
    setSearchQuery(query);
  }, [searchParams]);

  // Load Categories & Products via Axios
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

  // Handle category change and sync URL
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
    setMaxPrice(2500);
    setMinRating(0);
    setSearchParams({});
  };

  // Filter & Sort
  const filteredProducts = products
    .filter((p) => p.price <= maxPrice)
    .filter((p) => (minRating > 0 ? (p.rating || 0) >= minRating : true))
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Catalog & Collections
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            {selectedCategory === 'all'
              ? 'Complete Collection'
              : `${selectedCategory.toUpperCase()} DROP`}
          </h1>
          <p className="text-sm text-slate-300">
            Filtered precision craftsmanship powered by live Axios API. Swap endpoints effortlessly when your custom server is ready.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 h-fit sticky top-28 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" /> Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search within page */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Keyword Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Filter titles..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Departments
            </label>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {cat.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Max Price</span>
              <span className="font-mono text-indigo-400 font-bold">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="2500"
              step="20"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>$20</span>
              <span>$2,500</span>
            </div>
          </div>

          {/* Customer Rating Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Minimum Rating
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 4, 4.5, 4.8].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`p-1.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    minRating === rating
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
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
          {/* Controls Bar: Sort, View, Count */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{filteredProducts.length}</span> pieces
              {selectedCategory !== 'all' && (
                <> in <span className="text-indigo-400 font-semibold uppercase">{selectedCategory}</span></>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="default">Featured / Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Items */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 animate-pulse space-y-4">
                  <div className="aspect-square bg-slate-800 rounded-xl" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No pieces match your criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try expanding your price range, clearing the search query, or selecting another department.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors cursor-pointer"
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
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-5 hover:border-indigo-500/50 transition-all"
                >
                  <img
                    src={p.thumbnail || p.images?.[0]}
                    alt={p.title}
                    className="w-36 h-36 rounded-xl object-cover bg-slate-950 shrink-0"
                  />
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                      <span className="uppercase tracking-wider text-indigo-400 font-semibold">{p.category}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" /> {p.rating ? Number(p.rating).toFixed(1) : '4.8'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                    <div className="text-lg font-bold text-white font-mono">
                      ${Number(p.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setQuickViewProduct(p)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
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

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
