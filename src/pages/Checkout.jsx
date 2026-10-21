import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuthUser } from '../context/AuthContext';
import { orderService } from '../services/api';
import { initiateRazorpayPayment } from '../services/razorpay';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../utils/format';

const INDIAN_STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Gujarat', 'West Bengal', 'Kerala', 'Rajasthan',
  'Haryana', 'Punjab', 'Madhya Pradesh', 'Andhra Pradesh', 'Bihar',
  'Odisha', 'Assam', 'Goa', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand',
  'Himachal Pradesh', 'Jammu & Kashmir', 'Chandigarh'
];

export function parseShippingAddress(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') return null;
  const str = rawStr.trim();
  if (!str) return null;

  let zipCode = '';
  const pinMatch = str.match(/-\s*PIN:\s*(\d{6})/i) || str.match(/\b(\d{6})\b/);
  if (pinMatch) {
    zipCode = pinMatch[1];
  }

  let state = '';
  const matchedState = INDIAN_STATES.find((s) => new RegExp(`\\b${s}\\b`, 'i').test(str));
  if (matchedState) {
    state = matchedState;
  }

  let beforePin = str;
  if (str.toLowerCase().includes('- pin:')) {
    beforePin = str.split(/-\s*PIN:/i)[0].trim();
  } else if (zipCode) {
    beforePin = str.replace(new RegExp(`\\b${zipCode}\\b.*$`, 'i'), '').trim();
  }

  const parts = beforePin
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length > 0 && state && parts[parts.length - 1].toLowerCase() === state.toLowerCase()) {
    parts.pop();
  }

  let city = '';
  if (parts.length > 1) {
    city = parts.pop();
  }

  const address = parts.join(', ') || beforePin;

  return {
    address: address.trim(),
    city: city.trim(),
    state: state || 'Maharashtra',
    zipCode: zipCode.trim(),
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, discountAmount, shipping, tax, total, clearCart, appliedCoupon, showToast } = useCart();
  const { user, isSignedIn } = useAuthUser();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    zipCode: '',
    country: 'India',
  });

  const [savedAddressFound, setSavedAddressFound] = useState(false);
  const [previousOrderInfo, setPreviousOrderInfo] = useState(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName || 'Valued',
        lastName: user.lastName || prev.lastName || 'Client',
        email: user.primaryEmailAddress?.emailAddress || prev.email || '',
      }));
    }
  }, [user]);

  React.useEffect(() => {
    let isMounted = true;
    async function loadAddressFromPreviousOrder() {
      if (!user?.id) return;
      setIsLoadingAddress(true);
      try {
        const orders = await orderService.getUserOrders(user.id);
        if (isMounted && Array.isArray(orders) && orders.length > 0) {
          const recentOrder = orders.find(
            (o) => o.shipping_address && o.shipping_address.trim().length > 0
          );
          if (recentOrder) {
            const parsed = parseShippingAddress(recentOrder.shipping_address);
            if (parsed && (parsed.address || parsed.city)) {
              setSavedAddressFound(true);
              setPreviousOrderInfo({
                id: recentOrder.id,
                shipping_address: recentOrder.shipping_address,
                createdAt: recentOrder.createdAt || recentOrder.created_at,
              });
              setFormData((prev) => ({
                ...prev,
                address: parsed.address || prev.address,
                city: parsed.city || prev.city,
                state: parsed.state || prev.state || 'Maharashtra',
                zipCode: parsed.zipCode || prev.zipCode,
                phone:
                  prev.phone ||
                  recentOrder.customer?.phone ||
                  recentOrder.customer_phone ||
                  '',
              }));
            }
          }
        }
      } catch (err) {
        console.warn('[Checkout] Failed to load previous order shipping address:', err.message);
      } finally {
        if (isMounted) setIsLoadingAddress(false);
      }
    }

    loadAddressFromPreviousOrder();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5 text-slate-900 dark:text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-600 dark:text-violet-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your shopping bag is empty</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Add pieces before attempting checkout.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-500/20 transition-all"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider bg-violet-600 text-white px-3 py-1 rounded-full shadow-sm shadow-violet-500/30">
            Security & Authentication
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Sign In Required Before Payment
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Please authenticate using your account before making the payment. This stores your transaction securely and generates your verified order tracking and invoice.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-5 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Preserved Items in Bag ({items.length})
            </h3>
            <span className="text-sm font-bold font-mono text-violet-600 dark:text-violet-400">
              Total: {formatINR(total)}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shrink-0 text-xs"
              >
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover bg-white dark:bg-slate-900"
                />
                <div className="max-w-[130px] truncate text-left">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{formatINR(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-6 text-center backdrop-blur-xl shadow-sm">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ready to finalize your purchase?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your bag is saved. After signing in, you will immediately return here to complete payment with Razorpay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sign-in?redirect_url=/checkout"
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
            >
              Sign In to Proceed <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/sign-up?redirect_url=/checkout"
              className="py-3.5 px-8 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              Create New Account
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Account Authentication
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-violet-500" /> Razorpay Verified
            </span>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    const shippingAddressStr = `${formData.address}, ${formData.city}, ${formData.state} - PIN: ${formData.zipCode || formData.zip || ''}, ${formData.country}`;

    if (paymentMethod === 'cod') {
      try {
        const orderPayload = {
          clerk_user_id: user?.id || null,
          customer: {
            ...formData,
            clerkUserId: user?.id || null,
          },
          items: items.map((it) => ({
            product_id: it.id,
            quantity: it.quantity,
            price: it.price,
          })),
          total_amount: total,
          shipping_address: shippingAddressStr,
          payment_method: 'Cash on Delivery',
          payment_status: 'Pending',
        };

        const createdOrder = await orderService.createOrder(orderPayload);
        try {
          const list = JSON.parse(localStorage.getItem('aura_placed_orders') || '[]');
          if (createdOrder?.id && !list.includes(createdOrder.id)) {
            list.unshift(createdOrder.id);
            localStorage.setItem('aura_placed_orders', JSON.stringify(list));
          }
        } catch (_) {}
        clearCart();
        showToast('Order confirmed with Cash on Delivery!', 'success');
        navigate(`/order-success/${createdOrder.id}`);
      } catch (err) {
        console.error('Error placing COD order:', err);
        setErrorMessage(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
        setIsProcessing(false);
      }
      return;
    }

    try {
      const rzpOrderResponse = await orderService.createRazorpayOrder({
        clerk_user_id: user?.id || null,
        customer: {
          ...formData,
          clerkUserId: user?.id || null,
        },
        items: items.map((it) => ({
          product_id: it.id,
          quantity: it.quantity,
          price: it.price,
        })),
        total_amount: total,
        shipping_address: shippingAddressStr,
      });

      const { order_id, razorpay_order_id, amount, currency, key_id } = rzpOrderResponse;

      await initiateRazorpayPayment({
        keyId: key_id,
        orderId: razorpay_order_id,
        amount: amount,
        currency: currency || 'INR',
        orderName: 'AURA LUXE',
        description: `Order #${order_id.slice(0, 8)}`,
        customer: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
        },
        onSuccess: async (paymentResponse) => {
          try {
            const verificationRes = await orderService.verifyPayment({
              order_id: order_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            try {
              const list = JSON.parse(localStorage.getItem('aura_placed_orders') || '[]');
              if (!list.includes(order_id)) {
                list.unshift(order_id);
                localStorage.setItem('aura_placed_orders', JSON.stringify(list));
              }
            } catch (_) {}

            clearCart();
            showToast('Payment verified successfully!', 'success');
            navigate(`/order-success/${order_id}`);
          } catch (verifyErr) {
            console.error('Verification failed:', verifyErr);
            setErrorMessage('Payment received but database verification failed. Contact support.');
            setIsProcessing(false);
          }
        },
        onDismiss: () => {
          setIsProcessing(false);
          showToast('Payment window closed. Order was not completed.', 'info');
        },
      });
    } catch (err) {
      console.error('Error starting payment:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to initiate Razorpay checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Express Checkout</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Encrypted payment gateway via Razorpay &bull; Delivery across India
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold">256-Bit SSL Secured</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-7 space-y-8">
          
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-5 backdrop-blur-xl shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm shadow-violet-500/30">
                1
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recipient Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone (for SMS updates)</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-5 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm shadow-violet-500/30">
                  2
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Delivery Destination</h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-500" /> Express Delivery
              </span>
            </div>

            {savedAddressFound && (
              <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2 text-slate-900 dark:text-white">
                  <MapPin className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Autofilled from your previous order:</span>
                    <span className="text-slate-600 dark:text-slate-300 block mt-0.5">
                      {formData.address}, {formData.city}, {formData.state} - {formData.zipCode}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      address: '',
                      city: '',
                      zipCode: '',
                    }));
                    setSavedAddressFound(false);
                  }}
                  className="shrink-0 text-[11px] font-semibold text-violet-600 dark:text-violet-400 underline cursor-pointer"
                >
                  Use a different address
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street name, building, apartment number"
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Mumbai, Bengaluru"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <select
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">PIN Code (6 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 400018"
                    pattern="[0-9]{6}"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  readOnly
                  name="country"
                  value="India (Pan-India Express Dispatch)"
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl px-3.5 py-2.5 text-xs cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-5 backdrop-blur-xl shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm shadow-violet-500/30">
                3
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment Method</h2>
            </div>

            <label
              className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                paymentMethod === 'razorpay'
                  ? 'border-violet-600 bg-violet-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 hover:border-violet-400'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
                className="mt-1 accent-violet-600"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Razorpay Payment Gateway</span>
                    <span className="text-[10px] bg-violet-600 text-white font-bold px-2 py-0.5 rounded-full shadow-sm">
                      RECOMMENDED
                    </span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pay securely using Credit/Debit Cards, UPI, NetBanking, Google Pay, PhonePe, or PayTM.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">UPI</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Visa / MC</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">RuPay</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">NetBanking</span>
                </div>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-violet-600 bg-violet-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 hover:border-violet-400'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="mt-1 accent-violet-600"
              />
              <div className="flex-1 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Pay on Delivery</span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Pay with cash or card upon delivery to your doorstep.
                </p>
              </div>
            </label>
          </div>

        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-6 sticky top-28 shadow-sm backdrop-blur-xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
              Acquisition Summary
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 truncate">
                    <p className="text-slate-900 dark:text-white font-semibold truncate">{item.title}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900 dark:text-white font-medium">{formatINR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono">-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Pan-India Shipping</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {shipping === 0 ? <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span> : formatINR(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span className="font-mono text-slate-900 dark:text-white">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-3">
                <span>Amount Payable</span>
                <span className="font-mono text-violet-600 dark:text-violet-400 text-xl font-bold">{formatINR(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting to Razorpay...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay {formatINR(total)} with Razorpay
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>256-Bit SSL Bank Encrypted by Razorpay</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Orders dispatch within 24 hours with VIP insured freight.
              </p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
