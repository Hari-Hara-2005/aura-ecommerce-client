import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import { subscribeClientSocket } from '../services/socket';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import {
  Filter,
  Search,
  Grid3X3,
  List,
  RotateCcw,
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

  useEffect(() => {
    const unsubStock = subscribeClientSocket('inventory:stock_updated', (updated) => {
      if (!updated || !updated.id) return;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? { ...p, stock: updated.stock !== undefined ? Number(updated.stock) : p.stock }
            : p
        )
      );
    });

    const unsubProd = subscribeClientSocket('product:updated', (updated) => {
      if (!updated || !updated.id) return;
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      );
    });

    return () => {
      unsubStock();
      unsubProd();
    };
  }, []);

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
      {/* Catalog Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-pink-600/10 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-slate-900/60 border border-violet-200/60 dark:border-violet-900/40 p-8 sm:p-12 overflow-hidden backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-violet-500/15 dark:bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-violet-600 text-white px-3 py-1 rounded-full shadow-sm shadow-violet-500/30">
            Catalog & Collections
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {selectedCategory === 'all'
              ? 'Complete Collection'
              : `${selectedCategory.toUpperCase()} DROP`}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Discover our collection of curated luxury pieces fetched directly from your store catalog with real-time stock sync.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block space-y-6 bg-white/80 dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-xl h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Keyword Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Filter titles..."
                className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 pl-9 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Departments
            </label>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
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
                        ? 'bg-violet-600 text-white font-semibold shadow-sm shadow-violet-500/25'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {catName.replace(/-/g, ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Max Price</span>
              <span className="font-mono text-violet-600 dark:text-violet-400 font-bold">{formatINR(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="200000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-violet-600 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>₹500</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Minimum Rating
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 4, 4.5, 4.8].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`p-1.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    minRating === rating
                      ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-500/25'
                      : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {rating === 0 ? 'Any' : `${rating}★`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white font-bold">{filteredProducts.length}</span> pieces
              {selectedCategory !== 'all' && (
                <> in <span className="text-violet-600 dark:text-violet-400 font-semibold uppercase">{selectedCategory}</span></>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="default">Featured / Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>

              <div className="flex items-center border border-slate-200 dark:border-slate-700/80 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                <div key={i} className="rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-4 animate-pulse space-y-4">
                  <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No pieces match your criteria</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try expanding your price range, clearing the search query, or selecting another department.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-violet-500/25 cursor-pointer"
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
                  className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center gap-5 hover:border-violet-500/60 dark:hover:border-violet-500/60 transition-all shadow-sm"
                >
                  <div className="relative w-36 h-36 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={p.thumbnail || p.images?.[0] || p.image}
                      alt={p.title || p.name}
                      className={`w-full h-full object-cover bg-slate-100 dark:bg-slate-800 ${p.stock !== undefined && Number(p.stock) <= 0 ? 'opacity-60 grayscale' : ''}`}
                    />
                    {p.stock !== undefined && Number(p.stock) <= 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white rounded-md shadow">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold">{p.category || 'Collection'}</span>
                      <span>•</span>
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" /> {p.rating ? Number(p.rating).toFixed(1) : '4.8'}
                      </span>
                      {p.stock !== undefined && Number(p.stock) <= 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] font-bold text-rose-500 uppercase">
                            Out of Stock
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.title || p.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>
                    <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                      {formatINR(p.price)}
                    </div>
                  </div>
                  <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setQuickViewProduct(p)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-violet-500/25 cursor-pointer"
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
