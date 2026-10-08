import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle,
  CreditCard,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useCart();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      showToast('Subscribed! Use promo code WELCOME20 for 20% off.', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-24">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-900/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Complimentary Delivery</h4>
                <p className="text-xs text-slate-400">On all qualifying orders over $150</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Razorpay Secured</h4>
                <p className="text-xs text-slate-400">256-bit SSL encrypted checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">30-Day Effortless Returns</h4>
                <p className="text-xs text-slate-400">Hassle-free exchange policy</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">24/7 VIP Concierge</h4>
                <p className="text-xs text-slate-400">Expert shopping advisors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl text-white tracking-wider">AURA LUXE</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Curated luxury craftsmanship spanning vanguard personal electronics, tailored couture, and artisanal accessories. Designed for discerning tastemakers.
            </p>
            
            {/* Newsletter input */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Join the Private Circle & Receive 20% Off
              </p>
              {subscribed ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Check your email! Code <span className="font-mono font-bold">WELCOME20</span> is ready.
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
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    Join <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Catalogues</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/products?category=smartphones" className="hover:text-white transition-colors">Smart Devices & Audio</Link></li>
              <li><Link to="/products?category=mens-watches" className="hover:text-white transition-colors">Swiss Horology</Link></li>
              <li><Link to="/products?category=womens-dresses" className="hover:text-white transition-colors">Atelier Couture</Link></li>
              <li><Link to="/products?category=fragrances" className="hover:text-white transition-colors">Artisanal Scents</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">New Season Arrivals</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Client Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/profile" className="hover:text-white transition-colors">Track Real-time Order</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Review Cart & Summary</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition-colors">Checkout & Payments</Link></li>
              <li><span className="text-slate-500 cursor-default">Warranty & Authenticity</span></li>
              <li><span className="text-slate-500 cursor-default">Global Shipping Terms</span></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Payment & Security</h4>
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                All transactions processed through Razorpay PCI-DSS certified gateway.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">Razorpay</span>
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">UPI</span>
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">Cards</span>
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">NetBanking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AURA Luxury Collective Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Notice</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
