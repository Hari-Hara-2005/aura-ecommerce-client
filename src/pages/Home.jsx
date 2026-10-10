import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import {
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';

const CATEGORY_IMAGE_MAP = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  watches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  fashion: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  fragrances: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
  luxury: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
};

const getCategoryImage = (name) => {
  if (!name) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80';
  const key = name.toLowerCase().trim();
  return CATEGORY_IMAGE_MAP[key] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80';
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodData, catList] = await Promise.all([
          productService.getProducts({ limit: 12 }),
          productService.getCategories(),
        ]);
        setFeaturedProducts(prodData.products || []);
        if (Array.isArray(catList)) {
          setCategories(catList);
        }
      } catch (err) {
        console.error('Failed to load featured products & categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts =
    activeTab === 'all'
      ? featuredProducts
      : featuredProducts.filter((p) => {
          const cat = (p.category_name || p.category || '').toLowerCase();
          return cat === activeTab.toLowerCase();
        });

  return (
    <div className="space-y-24 text-slate-900">
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-pink-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>The Spring/Summer 2026 Collective is Live</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08] font-display">
                Pure Craftsmanship.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Unrivaled Precision.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover exceptional electronics, Swiss automatic chronographs, and Italian haute couture. Sourced for those who demand nothing less than perfection.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  Explore Drops
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">18k+</div>
                  <div className="text-xs text-slate-500 mt-0.5">Discerning Clients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">100%</div>
                  <div className="text-xs text-slate-500 mt-0.5">Verified Genuine</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">4.95 ★</div>
                  <div className="text-xs text-slate-500 mt-0.5">Trustpilot Score</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden bg-white border border-slate-200 p-3 shadow-xl">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80"
                    alt="Chronos Luminary Ceramic Watch"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-xl shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                          Featured Drop
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">Chronos Luminary Obsidian</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5 font-semibold">₹74,999</p>
                      </div>
                      <Link
                        to="/products"
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 p-8 sm:p-12 relative overflow-hidden shadow-xs">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>LIMITED TIME FLASH EVENT</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                Save Up To 30% Off Selected Atelier Pieces
              </h2>
              <p className="text-sm text-slate-600 max-w-lg">
                Use code <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">AURA10</span> at checkout for an extra 10% instant rebate.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center p-3 rounded-2xl bg-white border border-slate-200 min-w-16 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Hours</span>
              </div>
              <span className="text-xl font-bold text-slate-400">:</span>
              <div className="text-center p-3 rounded-2xl bg-white border border-slate-200 min-w-16 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Mins</span>
              </div>
              <span className="text-xl font-bold text-slate-400">:</span>
              <div className="text-center p-3 rounded-2xl bg-white border border-slate-200 min-w-16 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Curated Domains
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Browse by Department
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const name = typeof cat === 'object' ? cat.name : cat;
            const desc = (typeof cat === 'object' && cat.description) ? cat.description : 'Curated luxury collection';
            const img = getCategoryImage(name);
            return (
              <Link
                key={cat.id || name}
                to={`/products?category=${encodeURIComponent(name)}`}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-slate-100 border border-slate-200 hover:border-indigo-500 transition-all duration-300 shadow-md"
              >
                <img
                  src={img}
                  alt={name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-300">
                    <span>Explore domain</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Hand-Selected Items
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Trending Releases
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Items' },
              ...categories.map((cat) => {
                const name = typeof cat === 'object' ? cat.name : cat;
                return { id: name, label: name };
              }),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-200 p-4 animate-pulse space-y-4">
                <div className="aspect-square bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </section>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
