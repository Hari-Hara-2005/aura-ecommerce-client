import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthUser } from '../context/AuthContext';
import { orderService } from '../services/api';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  LogOut,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../utils/format';

export default function Profile() {
  const { user, isSignedIn, signOut, isClerkEnabled } = useAuthUser();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    async function loadOrders() {
      try {
        let userOrders = [];
        if (user?.id) {
          const list = await orderService.getUserOrders(user.id);
          if (Array.isArray(list)) userOrders.push(...list);
        }
        try {
          const localIds = JSON.parse(localStorage.getItem('aura_placed_orders') || '[]');
          const missing = localIds.filter((id) => !userOrders.some((o) => o.id === id));
          if (missing.length > 0) {
            const extras = await Promise.all(missing.map((id) => orderService.getOrderById(id).catch(() => null)));
            extras.forEach((e) => {
              if (e && e.id && !userOrders.some((o) => o.id === e.id)) userOrders.push(e);
            });
          }
        } catch (_) {}
        userOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setOrders(userOrders);
      } catch (err) {
        console.error('Failed to load user orders:', err);
        setOrders([]);
      }
    }
    loadOrders();
  }, [user?.id]);

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-600 dark:text-violet-400 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Client Session Required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sign in to view your account settings or look up your order history directly.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/sign-in"
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-500/20 transition-all"
          >
            Sign In Now
          </Link>
          <Link
            to="/orders"
            className="px-5 py-2.5 bg-white/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
          >
            Track Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900 dark:text-slate-100">
      
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            <img
              src={user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500/30 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user?.fullName || 'Collector Account'}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                Member
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {user?.primaryEmailAddress?.emailAddress || 'collector@aura.com'}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-slate-500 dark:text-slate-400 mt-2.5">
              <span>Member since 2026</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified Client
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-900 flex items-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-violet-600 dark:border-violet-400 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" /> Orders & Invoices ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-violet-600 dark:border-violet-400 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Security & Gateway
        </button>
        <Link
          to="/orders"
          className="ml-auto pb-3 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
        >
          Full Order History Portal →
        </Link>
      </div>

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-16 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-600 dark:text-violet-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No prior acquisitions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Pieces you purchase using Razorpay checkout will immediately display here with tracking numbers and download receipts.
              </p>
              <Link
                to="/products"
                className="inline-block px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-500/20"
              >
                Browse Catalogue
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-violet-500/40 dark:hover:border-violet-500/40 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{ord.id}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                        {ord.status || 'Confirmed'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Total</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                        {formatINR(ord.pricing?.total || ord.total_amount || 0)}
                      </span>
                    </div>

                    <Link
                      to={`/order-success/${ord.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      Receipt <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <img
                        src={item.thumbnail || item.image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{item.title || item.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Security Tab Content */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 max-w-xl space-y-4 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Payment & Authentication Status</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Account Authentication Status</span>
              <p className="text-slate-600 dark:text-slate-400">
                {isClerkEnabled ? 'Live Clerk Mode Active' : 'Interactive Demo Mode Active'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Razorpay Merchant Gateway</span>
              <p className="text-slate-600 dark:text-slate-400">
                Connected via Razorpay standard SDK with automated test simulator fallback.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
