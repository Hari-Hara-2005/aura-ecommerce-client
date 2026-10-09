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
  Sparkles,
  ArrowLeft,
  Truck,
  UserCheck,
} from 'lucide-react';

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
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-2xl">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Your Shopping Bag is Empty</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You haven't added any pieces to your bag yet. Explore our curated catalog of vanguard electronics, horology, and couture.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
        >
          Explore Catalogue <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Shopping Bag</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review your selected pieces ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" /> Clear Shopping Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row items-center gap-5 backdrop-blur-sm"
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-slate-950 shrink-0 border border-slate-800"
              />

              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {item.brand || 'AURA'}
                    </span>
                    <h3 className="text-base font-bold text-white hover:text-indigo-300 transition-colors">
                      <Link to={`/products/${item.id}`}>{item.title}</Link>
                    </h3>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                  {item.selectedColor && (
                    <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 text-[11px]">
                      Color: {item.selectedColor}
                    </span>
                  )}
                  {item.selectedSize && (
                    <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 text-[11px]">
                      Size: {item.selectedSize}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950 px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-white font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-white font-mono">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        (${Number(item.price).toFixed(2)} each)
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
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6 backdrop-blur-md sticky top-28 shadow-2xl">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
              Order Summary
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Promotional Code</span>
                <span className="text-[10px] text-indigo-400 lowercase font-normal">
                  Try: AURA10, WELCOME20
                </span>
              </label>

              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <Tag className="w-4 h-4" />
                    <span>{appliedCoupon.code} ({appliedCoupon.description})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-400 hover:underline cursor-pointer font-bold"
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
                    className="flex-1 bg-slate-950 border border-slate-800 text-white uppercase font-mono text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-700"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-3 text-xs text-slate-400 border-t border-slate-800 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-200 font-semibold">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-mono text-slate-200">
                  {shipping === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (5%)</span>
                <span className="font-mono text-slate-200">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-white border-t border-slate-800 pt-4">
                <span>Grand Total</span>
                <span className="font-mono text-indigo-400 text-xl font-bold">${total.toFixed(2)}</span>
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
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              {isSignedIn ? 'Proceed to Razorpay Checkout' : 'Sign In to Proceed to Checkout'} <ArrowRight className="w-4 h-4" />
            </button>

            {!isSignedIn && (
              <p className="text-[11px] text-amber-300 text-center font-medium bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                🔒 You will be asked to sign in with Clerk before payment to secure your order and receipt.
              </p>
            )}

            <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Direct Bank & UPI Integration via Razorpay</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
