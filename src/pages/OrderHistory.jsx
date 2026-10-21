import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthUser } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';
import { subscribeClientSocket, joinOrderTracking } from '../services/socket';
import { formatINR } from '../utils/format';

import {
  Package,
  Search,
  ExternalLink,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  CreditCard,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function OrderHistory() {
  const navigate = useNavigate();
  const { user, isSignedIn } = useAuthUser();
  const { addToCart, showToast } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);

  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const loadUserOrders = async () => {
    if (!isSignedIn) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let fetchedOrders = [];

      if (user?.id) {
        const byUser = await orderService.getUserOrders(user.id);
        if (Array.isArray(byUser)) fetchedOrders.push(...byUser);
      }

      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (userEmail) {
        const byEmail = await orderService.getUserOrders(null, { email: userEmail });
        if (Array.isArray(byEmail)) {
          for (const ord of byEmail) {
            if (!fetchedOrders.some((o) => o.id === ord.id)) {
              fetchedOrders.push(ord);
            }
          }
        }
      }

      try {
        const localIds = JSON.parse(localStorage.getItem('aura_placed_orders') || '[]');
        if (Array.isArray(localIds) && localIds.length > 0) {
          const missingIds = localIds.filter((id) => !fetchedOrders.some((o) => o.id === id));
          if (missingIds.length > 0) {
            const fetchedMissing = await Promise.all(
              missingIds.map((id) => orderService.getOrderById(id).catch(() => null))
            );
            for (const ord of fetchedMissing) {
              if (ord && ord.id && !fetchedOrders.some((o) => o.id === ord.id)) {
                const matchesUser =
                  (ord.clerk_user_id && ord.clerk_user_id === user?.id) ||
                  (userEmail && ord.customer?.email && ord.customer.email.toLowerCase() === userEmail.toLowerCase());
                if (matchesUser) {
                  fetchedOrders.push(ord);
                }
              }
            }
          }
        }
      } catch (_) {}

      fetchedOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserOrders();
  }, [user?.id, isSignedIn]);

  useEffect(() => {
    const unsubOrderUpdated = subscribeClientSocket('order:status_updated', (payload) => {
      if (!payload || !payload.orderId) return;

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === payload.orderId) {
            const updated = {
              ...ord,
              status: payload.status || ord.status,
              payment_status: payload.payment_status || ord.payment_status,
            };
            if (trackingModalOrder && trackingModalOrder.id === payload.orderId) {
              setTrackingModalOrder(updated);
            }
            return updated;
          }
          return ord;
        })
      );
    });

    const unsubOrderCreated = subscribeClientSocket('order:created', (newOrder) => {
      if (!newOrder || !newOrder.id) return;
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const isMine =
        (newOrder.clerk_user_id && newOrder.clerk_user_id === user?.id) ||
        (userEmail && newOrder.customer?.email && newOrder.customer.email.toLowerCase() === userEmail.toLowerCase());

      if (isMine) {
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
      }
    });

    return () => {
      unsubOrderUpdated();
      unsubOrderCreated();
    };
  }, [user?.id, trackingModalOrder]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast('Order ID copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenTracking = (order) => {
    joinOrderTracking(order.id);
    setTrackingModalOrder(order);
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    let addedCount = 0;
    order.items.forEach((it) => {
      addToCart(
        {
          id: it.product_id || it.id,
          title: it.title || it.name,
          price: it.price,
          thumbnail: it.thumbnail || it.image,
          stock: 99,
        },
        it.quantity || 1
      );
      addedCount++;
    });
    showToast(`Added ${addedCount} items to your shopping bag!`, 'success');
    navigate('/cart');
  };

  const handleManualLookup = async (e) => {
    e.preventDefault();
    const query = lookupQuery.trim();
    if (!query) return;

    setLookupLoading(true);
    setLookupError('');

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

      if (isUuid) {
        const found = await orderService.getOrderById(query);
        if (found && found.id) {
          setOrders((prev) => {
            if (prev.some((o) => o.id === found.id)) return prev;
            return [found, ...prev];
          });
          setLookupQuery('');
          showToast(`Order #${found.id.slice(0, 8)} located!`, 'success');
          handleOpenTracking(found);
          setLookupLoading(false);
          return;
        }
      }

      const byEmail = await orderService.getUserOrders(null, { email: query });
      if (Array.isArray(byEmail) && byEmail.length > 0) {
        setOrders((prev) => {
          const merged = [...prev];
          byEmail.forEach((ord) => {
            if (!merged.some((o) => o.id === ord.id)) merged.unshift(ord);
          });
          return merged;
        });
        setLookupQuery('');
        showToast(`Located ${byEmail.length} orders for ${query}!`, 'success');
      } else {
        setLookupError('No orders found matching that ID or email.');
      }
    } catch (err) {
      console.error('Order lookup failed:', err);
      setLookupError('Could not find order. Verify the ID or email.');
    } finally {
      setLookupLoading(false);
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter === 'ALL') return true;
      const st = (order.status || 'CONFIRMED').toUpperCase();
      return st === statusFilter;
    })
    .filter((order) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const idMatch = (order.id || '').toLowerCase().includes(q);
      const itemsMatch = order.items?.some((it) =>
        (it.title || it.name || '').toLowerCase().includes(q)
      );
      return idMatch || itemsMatch;
    });

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const deliveredCount = orders.filter((o) => (o.status || '').toUpperCase() === 'DELIVERED').length;
  const activeOrdersCount = orders.filter((o) => ['CONFIRMED', 'SHIPPED', 'IN TRANSIT'].includes((o.status || 'CONFIRMED').toUpperCase())).length;

  const renderStatusBadge = (status) => {
    const s = (status || 'CONFIRMED').toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    }
    if (s === 'SHIPPED' || s === 'DISPATCHED' || s === 'IN TRANSIT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
          <Truck className="w-3.5 h-3.5" /> In Transit
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 line-through">
          <X className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60">
        <Clock className="w-3.5 h-3.5" /> Confirmed / Processing
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-950 text-white p-8 sm:p-12 overflow-hidden border border-slate-800/80 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-semibold backdrop-blur-md">
            <Package className="w-4 h-4 text-violet-300" />
            <span>Order History & Dispatch Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            My Orders & Tracking
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Review your order receipts, track live courier fulfillment, and download verified Razorpay invoices.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-200/50 dark:border-violet-800/40">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Orders</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{orders.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/40">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Acquisitions Total</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{formatINR(totalSpent)}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/40">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Active / In Transit</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{activeOrdersCount}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Delivered</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{deliveredCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Lookup Bar */}
      <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: 'ALL', label: `All Orders (${orders.length})` },
              { id: 'CONFIRMED', label: 'Processing' },
              { id: 'SHIPPED', label: 'Dispatched' },
              { id: 'DELIVERED', label: 'Delivered' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or piece name..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <form onSubmit={handleManualLookup} className="flex flex-col sm:flex-row gap-3 items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-violet-500" />
              Lookup Specific Order:
            </span>
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => {
                setLookupQuery(e.target.value);
                setLookupError('');
              }}
              placeholder="Paste Order UUID or buyer email..."
              className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono"
            />
            <button
              type="submit"
              disabled={lookupLoading || !lookupQuery.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer shrink-0 shadow-md shadow-violet-500/20"
            >
              {lookupLoading ? 'Locating...' : 'Locate Order'}
            </button>
            <button
              type="button"
              onClick={loadUserOrders}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Refresh order list"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </form>
          {lookupError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {lookupError}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
              </div>
              <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (!isSignedIn && orders.length === 0) ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-center space-y-6 max-w-xl mx-auto my-6 shadow-xl">
          <div className="w-20 h-20 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/60 flex items-center justify-center mx-auto text-violet-600 dark:text-violet-400">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to View Your Orders</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Order history, invoices, and shipment tracking are protected and only visible to the order owner. Sign in to your account to review your purchases and track active deliveries.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/sign-in?redirect_url=/orders"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign In to Your Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700"
            >
              Explore Products
            </Link>
          </div>
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 text-slate-400 text-[11px]">
            Placed an order without an account? Enter your Order UUID or checkout email in the "Lookup Specific Order" search bar above.
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-center space-y-5 shadow-xs">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Orders Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No acquisitions match your filter criteria. Try resetting your query.'
                : 'You have not placed any orders yet. Pieces you checkout will appear here with live tracking.'}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all"
          >
            Explore Catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const itemCount = order.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0;
            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:border-violet-500/40 dark:hover:border-violet-500/40 transition-all shadow-xs hover:shadow-md"
              >
                <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Order Placed</span>
                      <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                    <div>
                      <span className="text-slate-400 block font-medium">Total Amount</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">
                        {formatINR(order.total_amount)}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                    <div>
                      <span className="text-slate-400 block font-medium">Dispatch Destination</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block truncate max-w-xs">
                        {order.customer?.city || order.shipping_address?.split(',')[1] || 'India'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-slate-900 dark:text-white">
                      <span>#{order.id.slice(0, 8)}</span>
                      <button
                        onClick={() => handleCopyId(order.id)}
                        className="hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer ml-1"
                        title="Copy full UUID"
                      >
                        {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {renderStatusBadge(order.status)}
                  </div>
                </div>

                <div className="p-5 sm:p-6 divide-y divide-slate-100 dark:divide-slate-800/80">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <img
                        src={item.thumbnail || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                        alt={item.title || item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition">
                          <Link to={`/products/${item.product_id || item.id}`}>
                            {item.title || item.name}
                          </Link>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Quantity: {item.quantity || 1} {item.selectedColor ? `• Finish: ${item.selectedColor}` : ''}
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {formatINR(item.price)}
                        </p>
                      </div>

                      <div className="hidden sm:block">
                        <Link
                          to={`/products/${item.product_id || item.id}`}
                          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors inline-block"
                        >
                          View Piece
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 sm:p-5 bg-slate-50/40 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                      {order.payment_method || 'Razorpay Gateway'}
                    </span>
                    <span>&bull;</span>
                    <span>
                      {itemCount} {itemCount === 1 ? 'piece' : 'pieces'} included
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenTracking(order)}
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-violet-500/20 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                    >
                      <Truck className="w-3.5 h-3.5" /> Track Shipment
                    </button>

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Reorder
                    </button>

                    <Link
                      to={`/order-success/${order.id}`}
                      className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title="View tax receipt"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative transition-colors duration-200">
            <button
              onClick={() => setTrackingModalOrder(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Live Fulfillment Progress
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Shipment Tracker
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Ref: {trackingModalOrder.id}
              </p>
            </div>

            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              <div className="flex items-start gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Order Confirmed & Payment Verified</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Razorpay instant ledger recorded with bank transaction authentication.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  ['SHIPPED', 'DISPATCHED', 'IN TRANSIT', 'DELIVERED'].includes((trackingModalOrder.status || '').toUpperCase())
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                    : 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                }`}>
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Curated & Packed at Atelier</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Quality inspection complete. Sealed in anti-tamper gift packaging.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  ['SHIPPED', 'DISPATCHED', 'IN TRANSIT', 'DELIVERED'].includes((trackingModalOrder.status || '').toUpperCase())
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">In Transit (Pan-India Air Cargo)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Expected transit window 2-3 business days with door delivery OTP.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  (trackingModalOrder.status || '').toUpperCase() === 'DELIVERED'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Final Handover</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Destination: {trackingModalOrder.shipping_address || 'Registered Delivery Address'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-violet-500/20 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
