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

  // Manual lookup state (for guest or specific order lookups)
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

      // 1. Fetch by user clerk ID if available
      if (user?.id) {
        const byUser = await orderService.getUserOrders(user.id);
        if (Array.isArray(byUser)) fetchedOrders.push(...byUser);
      }

      // 2. Also check if user has an email and query by email
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

      // 3. Check local session placed orders (only if they match the signed-in user)
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

      // Sort by newest first
      fetchedOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to load order history:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserOrders();

    // Listen to real-time status updates via WebSocket
    const unsubStatus = subscribeClientSocket('order:status_updated', (data) => {
      setOrders((prev) => {
        const found = prev.some((o) => o.id === data.orderId);
        if (found) {
          showToast(`⚡ Order #${String(data.orderId).slice(0, 8).toUpperCase()} updated to ${data.status}!`, 'info');
          return prev.map((ord) =>
            ord.id === data.orderId
              ? {
                  ...ord,
                  status: data.status,
                  payment_status: data.payment_status || ord.payment_status,
                  updatedAt: data.updated_at || new Date().toISOString(),
                }
              : ord
          );
        }
        return prev;
      });
    });

    const unsubCreated = subscribeClientSocket('order:created', (newOrder) => {
      // If order belongs to current customer, reload orders
      loadUserOrders();
    });

    return () => {
      unsubStatus();
      unsubCreated();
    };
  }, [user?.id, isSignedIn, showToast]);


  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast('Order ID copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReorder = (item) => {
    addToCart(
      {
        id: item.product_id || item.id,
        title: item.title || item.name,
        price: item.price,
        thumbnail: item.thumbnail || item.image,
      },
      item.quantity || 1
    );
  };

  const handleManualLookup = async (e) => {
    e.preventDefault();
    const query = lookupQuery.trim();
    if (!query) return;

    setLookupLoading(true);
    setLookupError('');
    try {
      let found = null;

      // Check if it's an order UUID
      if (query.includes('-') || query.length >= 8) {
        found = await orderService.getOrderById(query);
      }

      // If not found by ID, try looking up by email
      if (!found) {
        const byEmail = await orderService.getUserOrders(null, { email: query });
        if (Array.isArray(byEmail) && byEmail.length > 0) {
          for (const ord of byEmail) {
            if (!orders.some((o) => o.id === ord.id)) {
              setOrders((prev) => [ord, ...prev]);
            }
          }
          showToast(`Found ${byEmail.length} orders linked to ${query}`, 'success');
          setLookupQuery('');
          setLookupLoading(false);
          return;
        }
      }

      if (found && found.id) {
        if (!orders.some((o) => o.id === found.id)) {
          setOrders((prev) => [found, ...prev]);
        }
        showToast(`Located order #${found.id.slice(0, 8)}`, 'success');
        setLookupQuery('');
      } else {
        setLookupError('No order found matching that reference or email.');
      }
    } catch (err) {
      setLookupError('Could not locate order. Please check the ID or email.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Filter and search
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.id?.toLowerCase().includes(q) ||
      order.shipping_address?.toLowerCase().includes(q) ||
      order.customer?.name?.toLowerCase().includes(q) ||
      order.items?.some((it) => (it.title || it.name || '').toLowerCase().includes(q));

    let matchesStatus = true;
    const st = (order.status || 'Confirmed').toUpperCase();
    if (statusFilter === 'CONFIRMED') matchesStatus = st === 'CONFIRMED' || st === 'PENDING';
    else if (statusFilter === 'SHIPPED') matchesStatus = st === 'SHIPPED' || st === 'IN TRANSIT' || st === 'DISPATCHED';
    else if (statusFilter === 'DELIVERED') matchesStatus = st === 'DELIVERED';
    else if (statusFilter === 'CANCELLED') matchesStatus = st === 'CANCELLED';

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalSpent = orders.reduce((acc, o) => acc + Number(o.pricing?.total || o.total_amount || 0), 0);
  const activeOrdersCount = orders.filter((o) => {
    const st = (o.status || '').toUpperCase();
    return st !== 'DELIVERED' && st !== 'CANCELLED';
  }).length;
  const deliveredCount = orders.filter((o) => (o.status || '').toUpperCase() === 'DELIVERED').length;

  const getStatusBadge = (status) => {
    const st = (status || 'Confirmed').toUpperCase();
    if (st === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
        </span>
      );
    }
    if (st === 'SHIPPED' || st === 'DISPATCHED' || st === 'IN TRANSIT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Truck className="w-3.5 h-3.5 text-blue-600" /> Shipped / In Transit
        </span>
      );
    }
    if (st === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <X className="w-3.5 h-3.5 text-rose-600" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" /> Confirmed / Processing
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-900">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
            <Package className="w-4 h-4 text-indigo-400" />
            <span>Order History & Dispatch Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            My Orders & Tracking
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Review your order receipts, track fulfillment dispatches, and download verified Razorpay transaction summaries.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">Total Orders</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{orders.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">Acquisitions Total</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{formatINR(totalSpent)}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">Active / In Transit</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{activeOrdersCount}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">Delivered</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{deliveredCount}</span>
          </div>
        </div>
      </div>

      {/* Search, Filter & Quick Lookup Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Status Tabs */}
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
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar inside orders */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or piece name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Quick Order Lookup Form (e.g. for guest / email lookups) */}
        <div className="pt-4 border-t border-slate-100">
          <form onSubmit={handleManualLookup} className="flex flex-col sm:flex-row gap-3 items-center">
            <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-600" />
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
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
            />
            <button
              type="submit"
              disabled={lookupLoading || !lookupQuery.trim()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {lookupLoading ? 'Locating...' : 'Locate Order'}
            </button>
            <button
              type="button"
              onClick={loadUserOrders}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
              title="Refresh order list"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </form>
          {lookupError && (
            <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {lookupError}
            </p>
          )}
        </div>
      </div>

      {/* Orders List Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200/80 animate-pulse space-y-4 shadow-xs">
              <div className="flex justify-between">
                <div className="h-5 bg-slate-200 rounded w-1/4" />
                <div className="h-5 bg-slate-200 rounded w-1/6" />
              </div>
              <div className="h-20 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (!isSignedIn && orders.length === 0) ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-6 shadow-xs max-w-xl mx-auto my-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">Sign In to View Your Orders</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Order history, invoices, and shipment tracking are protected and only visible to the order owner. Sign in to your account to review your purchases and track active deliveries.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/sign-in?redirect_url=/orders"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign In to Your Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center"
            >
              Explore Products
            </Link>
          </div>
          <div className="pt-4 border-t border-slate-100 text-slate-400 text-[11px]">
            Placed an order without an account? Enter your Order UUID or checkout email in the "Lookup Specific Order" search bar above.
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-5 shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No acquisitions match your filter criteria. Try resetting your query.'
                : 'You have not placed any orders yet. Pieces you checkout will appear here with live tracking.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {(searchQuery || statusFilter !== 'ALL') ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Clear Filters
              </button>
            ) : null}
            <Link
              to="/products"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              Explore Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent Order';

            return (
              <div
                key={order.id}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden"
              >
                {/* Order Card Header */}
                <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-500">Order</span>
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {order.id}
                      </span>
                      <button
                        onClick={() => handleCopyOrderId(order.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-all cursor-pointer"
                        title="Copy Order ID"
                      >
                        {copiedId === order.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-medium">{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                        {order.payment_method || 'Razorpay / Card'}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200/60">
                        {order.payment_status || 'Paid'}
                      </span>
                      {order.shipping_address && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 truncate max-w-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {order.shipping_address}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">
                        Total Amount
                      </span>
                      <span className="text-xl font-extrabold text-slate-900 font-mono">
                        {formatINR(order.pricing?.total || order.total_amount || 0)}
                      </span>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                </div>

                {/* Items List in this order */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={item.thumbnail || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80'}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                          />
                          <div>
                            <Link
                              to={item.product_id ? `/products/${item.product_id}` : '/products'}
                              className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                            >
                              {item.title || item.name || 'Artisan Collection Piece'}
                            </Link>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                              <span>Qty: <strong className="text-slate-800">{item.quantity || 1}</strong></span>
                              <span>•</span>
                              <span>Unit Price: <strong className="text-slate-800 font-mono">{formatINR(item.price || 0)}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center">
                          <span className="font-mono font-extrabold text-sm text-slate-900">
                            {formatINR((item.price || 0) * (item.quantity || 1))}
                          </span>
                          <button
                            onClick={() => handleReorder(item)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-xs font-semibold text-slate-700 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Add this piece back to shopping bag"
                          >
                            <RotateCcw className="w-3 h-3 text-indigo-600" /> Buy Again
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Razorpay Buyer Protection Activated
                    </span>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => setTrackingModalOrder(order)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        Track Package
                      </button>

                      <Link
                        to={`/order-success/${order.id}`}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Receipt & Invoice
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Package Tracking Timeline Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setTrackingModalOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 mb-2">
                <Truck className="w-3 h-3 text-indigo-600" /> Air Express Fulfillment
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Delivery Timeline
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Ref: {trackingModalOrder.id}
              </p>
            </div>

            {/* Visual Stepper */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
              <div className="flex items-start gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Order Confirmed & Payment Verified</h4>
                  <p className="text-[11px] text-slate-500">Razorpay instant ledger recorded with bank transaction authentication.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  ['SHIPPED', 'DISPATCHED', 'IN TRANSIT', 'DELIVERED'].includes((trackingModalOrder.status || '').toUpperCase())
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white animate-pulse'
                }`}>
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Curated & Packed at Atelier</h4>
                  <p className="text-[11px] text-slate-500">Quality inspection complete. Sealed in anti-tamper gift packaging.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  ['SHIPPED', 'DISPATCHED', 'IN TRANSIT', 'DELIVERED'].includes((trackingModalOrder.status || '').toUpperCase())
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">In Transit (Pan-India Air Cargo)</h4>
                  <p className="text-[11px] text-slate-500">Expected transit window 2-3 business days with door delivery OTP.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  (trackingModalOrder.status || '').toUpperCase() === 'DELIVERED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Final Handover</h4>
                  <p className="text-[11px] text-slate-500">Destination: {trackingModalOrder.shipping_address || 'Registered Delivery Address'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
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
