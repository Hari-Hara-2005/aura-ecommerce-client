import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuthUser } from '../context/AuthContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { formatINR } from '../utils/format';

export default function Cart() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuthUser();
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shipping,
    tax,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCoupon(couponCode);
      setCouponCode('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">Your Shopping Bag is Empty</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You haven't added any pieces to your bag yet. Explore our curated catalog of vanguard electronics, horology, and couture.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
        >
          Explore Catalogue <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Your Shopping Bag</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected pieces ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto font-semibold"
        >
          <Trash2 className="w-4 h-4" /> Clear Shopping Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all flex flex-col sm:flex-row items-center gap-5"
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-slate-50 shrink-0 border border-slate-100"
              />

              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {item.brand || 'AURA'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                      <Link to={`/products/${item.id}`}>{item.title}</Link>
                    </h3>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
                  {item.selectedColor && (
                    <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium">
                      Color: {item.selectedColor}
                    </span>
                  )}
                  {item.selectedSize && (
                    <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium">
                      Size: {item.selectedSize}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="p-1 text-slate-500 hover:text-slate-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="p-1 text-slate-500 hover:text-slate-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900 font-mono">
                      {formatINR(item.price * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        ({formatINR(item.price)} each)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-6 sticky top-28 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Order Summary
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Promotional Code</span>
                <span className="text-[10px] text-indigo-600 lowercase font-normal">
                  Try: AURA10, WELCOME20, LUXE500
                </span>
              </label>

              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>{appliedCoupon.code} ({appliedCoupon.description})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline cursor-pointer font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code..."
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 uppercase font-mono text-xs rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-200"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-900 font-semibold">{formatINR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono">-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Pan-India Shipping</span>
                <span className="font-mono text-slate-900 font-medium">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatINR(shipping)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span className="font-mono text-slate-900">{formatINR(tax)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-4">
                <span>Grand Total</span>
                <span className="font-mono text-indigo-600 text-xl font-bold">{formatINR(total)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isSignedIn) {
                  navigate('/sign-in?redirect_url=/checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] cursor-pointer"
            >
              {isSignedIn ? 'Proceed to Razorpay Checkout' : 'Sign In to Proceed to Checkout'} <ArrowRight className="w-4 h-4" />
            </button>

            {!isSignedIn && (
              <p className="text-[11px] text-amber-800 text-center font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                🔒 You will be asked to sign in with Clerk before payment to secure your order and receipt.
              </p>
            )}

            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Direct Bank & UPI Integration via Razorpay</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
