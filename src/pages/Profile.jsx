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
      if (user?.id) {
        try {
          const list = await orderService.getUserOrders(user.id);
          setOrders(Array.isArray(list) ? list : []);
        } catch (err) {
          console.error('Failed to load user orders:', err);
          setOrders([]);
        }
      }
    }
    loadOrders();
  }, [user?.id]);

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Client Session Required</h2>
        <p className="text-xs text-slate-500">
          Sign in to view your orders, saved addresses, and concierge settings.
        </p>
        <Link
          to="/sign-in"
          className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
            alt=""
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
          />
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{user?.fullName || 'Collector Account'}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                VIP Tier
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.primaryEmailAddress?.emailAddress || 'collector@aura.com'}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-slate-500 mt-2">
              <span>Member since 2026</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Razorpay Verified Client
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-indigo-600" /> Orders & Invoices ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600" /> Security & Gateway
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No prior acquisitions</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pieces you purchase using Razorpay checkout will immediately display here with tracking numbers and download receipts.
              </p>
              <Link
                to="/products"
                className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Browse Catalogue
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 hover:border-slate-300 shadow-xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{ord.id}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        {ord.status || 'Confirmed'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Total</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatINR(ord.pricing?.total || ord.total_amount || 0)}
                      </span>
                    </div>

                    <Link
                      to={`/order-success/${ord.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                    >
                      Receipt <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <img
                        src={item.thumbnail || item.image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 truncate">{item.title || item.name}</p>
                        <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 max-w-xl space-y-4 text-xs text-slate-600 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Payment & Authentication Status</h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-indigo-700 block">Account Authentication Status</span>
              <p className="text-slate-600">
                {isClerkEnabled ? 'Live Clerk Mode Active' : 'Interactive Demo Mode Active (Add VITE_CLERK_PUBLISHABLE_KEY in .env to switch to Clerk live)'}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-purple-700 block">Razorpay Merchant Gateway</span>
              <p className="text-slate-600">
                Connected via Razorpay standard SDK with automated test simulator fallback.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
