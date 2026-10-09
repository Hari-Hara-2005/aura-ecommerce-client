import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import {
  CheckCircle,
  Package,
  Truck,
  Download,
  ArrowRight,
  Sparkles,
  Printer,
  ShieldCheck,
} from 'lucide-react';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orders = orderService.getUserOrders();
    const found = orders.find((o) => o.id === orderId) || orders[0];
    setOrder(found);
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Retrieving order invoice...</p>
      </div>
    );
  }

  const { customer, items, pricing, payment } = order;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/20">
            <CheckCircle className="w-10 h-10 animate-bounce-in" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Payment Verified & Dispatched
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Thank You For Your Acquisition
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Order <span className="font-mono text-indigo-400 font-bold">{order.id}</span> has been confirmed. A formal receipt and tracking link have been dispatched to {customer?.email}.
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-8 backdrop-blur-md shadow-2xl">
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">Order Ref</span>
            <span className="font-mono font-bold text-white mt-0.5 block truncate">{order.id}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Timestamp</span>
            <span className="text-slate-300 mt-0.5 block">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Payment Method</span>
            <span className="text-indigo-400 font-bold mt-0.5 block">Razorpay Express</span>
          </div>
          <div>
            <span className="text-slate-500 block">Status</span>
            <span className="text-emerald-400 font-bold mt-0.5 block">Payment Confirmed</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Acquired Items
          </h3>
          <div className="space-y-3">
            {items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 text-xs p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                />
                <div className="flex-1 truncate">
                  <h4 className="font-bold text-white truncate">{item.title}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Quantity: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                  </p>
                </div>
                <div className="text-right font-mono font-bold text-white text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-300 block">Delivery Address</span>
            <p className="text-slate-400 leading-relaxed">
              {customer?.firstName} {customer?.lastName}<br />
              {customer?.address}<br />
              {customer?.city}, {customer?.state} {customer?.zipCode}<br />
              {customer?.country}
            </p>
          </div>

          <div className="space-y-2 text-slate-400">
            <span className="font-bold text-slate-300 block">Financial Summary</span>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">${pricing?.subtotal?.toFixed(2)}</span>
            </div>
            {pricing?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span className="font-mono">-${pricing?.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-mono text-slate-200">
                {pricing?.shipping === 0 ? 'FREE' : `$${pricing?.shipping?.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
              <span>Amount Paid</span>
              <span className="font-mono text-indigo-400 text-base">${pricing?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Tax Receipt
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/profile"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors"
            >
              Order History
            </Link>
            <Link
              to="/products"
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
