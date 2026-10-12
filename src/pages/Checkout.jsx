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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Your shopping bag is empty</h2>
        <p className="text-sm text-slate-500">Add pieces before attempting checkout.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Security & Authentication
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Sign In Required Before Payment
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Please authenticate using your account before making the payment. This stores your transaction securely and generates your verified order tracking and invoice.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-600" /> Preserved Items in Bag ({items.length})
            </h3>
            <span className="text-sm font-bold font-mono text-indigo-600">
              Total: {formatINR(total)}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0 text-xs"
              >
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover bg-white"
                />
                <div className="max-w-[130px] truncate">
                  <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{formatINR(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 space-y-6 shadow-sm text-center">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Ready to finalize your purchase?</h3>
            <p className="text-xs text-slate-500">
              Your bag is saved. After signing in, you will immediately return here to complete payment with Razorpay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sign-in?redirect_url=/checkout"
              className="py-3.5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              Sign In to Proceed <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/sign-up?redirect_url=/checkout"
              className="py-3.5 px-8 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              Create New Account
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Account Authentication
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Razorpay Verified
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

    // 1. Cash on Delivery (COD) Flow
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

    // 2. Real Razorpay Payment Flow
    try {
      // Step A: Initiate Order on Backend (PostgreSQL + Razorpay Order API)
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

      // Step B: Open official Razorpay Checkout popup
      await initiateRazorpayPayment({
        keyId: key_id,
        orderId: razorpay_order_id,
        amount: amount, // in paise
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
            // Step C: Cryptographically verify payment on backend & save to database
            const verificationRes = await orderService.verifyPayment({
              order_id: order_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              amount: total,
              payment_method: 'Razorpay',
            });

            if (verificationRes.success) {
              clearCart();
              showToast('Payment successful! Order confirmed.', 'success');
              navigate(`/order-success/${order_id}`);
            } else {
              setErrorMessage(verificationRes.message || 'Payment signature verification failed.');
              setIsProcessing(false);
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setErrorMessage(
              verifyErr.response?.data?.message || 'Payment verification failed on backend. Please contact support.'
            );
            setIsProcessing(false);
          }
        },
        onFailure: (err) => {
          console.error('Razorpay payment error:', err);
          setIsProcessing(false);
          setErrorMessage(err.description || err.message || 'Payment was declined or failed.');
          showToast(err.description || 'Payment was declined.', 'error');
        },
        onDismiss: () => {
          setIsProcessing(false);
          showToast('Payment window closed.', 'info');
        },
      });
    } catch (err) {
      console.error('Failed to initiate Razorpay order:', err);
      setIsProcessing(false);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Could not initiate Razorpay checkout. Please verify credentials in Backend/.env.'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Express Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your acquisition securely through Razorpay
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-7 space-y-8">
          
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                1
              </div>
              <h2 className="text-base font-bold text-slate-900">Contact Credentials</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (For Razorpay SMS)</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </div>
                <h2 className="text-base font-bold text-slate-900">Shipping Destination</h2>
              </div>
              {savedAddressFound && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Autofilled from Previous Order</span>
                </div>
              )}
            </div>

            {savedAddressFound && previousOrderInfo && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-indigo-950 min-w-0">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">
                    Address retrieved from your recent order <span className="font-mono font-bold">#{previousOrderInfo.id?.slice(0, 8)}</span>
                  </span>
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
                  className="shrink-0 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Use a different address
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street name, building, apartment number"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Mumbai, Bengaluru"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-white text-slate-900">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code (6 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 400018"
                    pattern="[0-9]{6}"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  readOnly
                  name="country"
                  value="India (Pan-India Express Dispatch)"
                  className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-3.5 py-2.5 text-xs cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                3
              </div>
              <h2 className="text-base font-bold text-slate-900">Payment Method</h2>
            </div>

            <label
              className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                paymentMethod === 'razorpay'
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Razorpay Payment Gateway</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                      RECOMMENDED
                    </span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pay securely using Credit/Debit Cards, UPI, NetBanking, Google Pay, PhonePe, or PayTM.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">UPI</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">Visa / MC</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">RuPay</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">NetBanking</span>
                </div>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1 space-y-1">
                <span className="font-bold text-slate-900 text-sm">Pay on Delivery</span>
                <p className="text-xs text-slate-600">
                  Pay with cash or card upon delivery to your doorstep.
                </p>
              </div>
            </label>
          </div>

        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-6 sticky top-28 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Acquisition Summary
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover bg-slate-50 shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 truncate">
                    <p className="text-slate-900 font-semibold truncate">{item.title}</p>
                    <p className="text-slate-500 text-[11px]">
                      Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900 font-medium">{formatINR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono">-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Pan-India Shipping</span>
                <span className="font-mono text-slate-900">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatINR(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span className="font-mono text-slate-900">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-3">
                <span>Amount Payable</span>
                <span className="font-mono text-indigo-600 text-xl font-bold">{formatINR(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
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
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
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
