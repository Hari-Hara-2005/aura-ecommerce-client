import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState([]);
  const { showToast } = useCart();

  useEffect(() => {
    productService
      .getCategories()
      .then((cats) => {
        if (Array.isArray(cats)) {
          setCategories(cats.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      showToast('Subscribed! Use promo code WELCOME20 for 20% off.', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-100/90 dark:bg-[#070A14] border-t border-slate-200/90 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-sm mt-24 transition-colors duration-200">
      {/* Top trust features section */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-semibold text-sm">Complimentary Delivery</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">On all Pan-India orders over ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-semibold text-sm">Razorpay Secured</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">256-bit encrypted payments</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-semibold text-sm">30-Day Effortless Returns</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hassle-free exchange policy</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-600/30">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-semibold text-sm">24/7 VIP Concierge</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Expert shopping advisors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-wider">AURA LUXE</span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
              Curated luxury craftsmanship spanning vanguard personal electronics, tailored couture, and artisanal accessories. Designed for discerning tastemakers.
            </p>
            
            <div className="pt-2">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                Join the Private Circle & Receive 20% Off
              </p>
              {subscribed ? (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Check your email! Code <span className="font-mono font-bold">WELCOME20</span> is ready.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors shadow-2xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md shadow-indigo-600/30"
                  >
                    Join <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-4">Catalogues</h4>
            <ul className="space-y-2.5 text-xs">
              {categories.map((cat) => {
                const name = typeof cat === 'object' ? cat.name : cat;
                return (
                  <li key={cat.id || name}>
                    <Link
                      to={`/products?category=${encodeURIComponent(name)}`}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {name}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link to="/products" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 dark:hover:text-indigo-300">
                  All Collections
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-4">Client Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/profile" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Track Real-time Order</Link></li>
              <li><Link to="/cart" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Review Cart & Summary</Link></li>
              <li><Link to="/checkout" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Checkout & Payments</Link></li>
              <li><span className="text-slate-400 dark:text-slate-500 cursor-default">Warranty & Authenticity</span></li>
              <li><span className="text-slate-400 dark:text-slate-500 cursor-default">Global Shipping Terms</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-4">Payment & Security</h4>
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All transactions processed through Razorpay PCI-DSS certified gateway.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-[11px] shadow-2xs">Razorpay</span>
                <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-[11px] shadow-2xs">UPI / QR</span>
                <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-[11px] shadow-2xs">RuPay</span>
                <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-[11px] shadow-2xs">NetBanking</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} AURA Luxury Collective India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Notice</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
