import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  Star,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
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
    async function loadFeatured() {
      setLoading(true);
      try {
        const data = await productService.getProducts({ limit: 8 });
        setFeaturedProducts(data.products || []);
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const categories = [
    {
      name: 'Vanguard Electronics',
      query: 'smartphones',
      desc: 'Headphones, Cameras & flagships',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Horology & Watches',
      query: 'mens-watches',
      desc: 'Ceramic & sapphire chronographs',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Atelier Couture',
      query: 'womens-dresses',
      desc: 'Italian cashmere & tailored trenches',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Artisanal Perfumery',
      query: 'fragrances',
      desc: 'Bourbon vanilla & amber extraits',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const filteredProducts =
    activeTab === 'all'
      ? featuredProducts
      : featuredProducts.filter((p) =>
          p.category?.toLowerCase().includes(activeTab.toLowerCase())
        );

  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>The Spring/Summer 2026 Collective is Live</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-[1.08] font-display">
                Pure Craftsmanship.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  Unrivaled Precision.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover exceptional electronics, Swiss automatic chronographs, and Italian haute couture. Sourced for those who demand nothing less than perfection.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/products?category=fragrances"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700/70 flex items-center justify-center gap-2 transition-all"
                >
                  Explore Drops
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">18k+</div>
                  <div className="text-xs text-slate-400 mt-0.5">Discerning Clients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">100%</div>
                  <div className="text-xs text-slate-400 mt-0.5">Verified Genuine</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">4.95 ★</div>
                  <div className="text-xs text-slate-400 mt-0.5">Trustpilot Score</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden bg-slate-900/80 border border-slate-800 p-3 shadow-2xl backdrop-blur-xl">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80"
                    alt="Chronos Luminary Ceramic Watch"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                          Featured Drop
                        </span>
                        <h3 className="text-sm font-bold text-white">Chronos Luminary Obsidian</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">$899.00 USD</p>
                      </div>
                      <Link
                        to="/products/102"
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
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
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-indigo-500/30 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>LIMITED TIME FLASH EVENT</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Save Up To 30% Off Selected Atelier Pieces
              </h2>
              <p className="text-sm text-slate-300 max-w-lg">
                Use code <span className="font-mono font-bold text-indigo-300 bg-indigo-900/50 px-2 py-0.5 rounded">AURA10</span> at checkout for an extra 10% instant rebate.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center p-3 rounded-2xl bg-slate-900/80 border border-slate-700 min-w-16">
                <span className="block text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Hours</span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="text-center p-3 rounded-2xl bg-slate-900/80 border border-slate-700 min-w-16">
                <span className="block text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Mins</span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="text-center p-3 rounded-2xl bg-slate-900/80 border border-slate-700 min-w-16">
                <span className="block text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Curated Domains
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Browse by Department
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.query}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 shadow-xl"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-400">
                  <span>Explore domain</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Hand-Selected Items
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Trending Releases
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'smartphones', label: 'Tech' },
              { id: 'watches', label: 'Watches' },
              { id: 'fragrances', label: 'Fragrances' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
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
              <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 animate-pulse space-y-4">
                <div className="aspect-square bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-800 rounded w-2/3" />
                <div className="h-4 bg-slate-800 rounded w-1/3" />
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
