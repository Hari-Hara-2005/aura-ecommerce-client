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
import { formatINR } from '../utils/format';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    async function loadOrder() {
      if (orderId) {
        try {
          const res = await orderService.getOrderById(orderId);
          if (res) {
            setOrder(res);
          }
        } catch (err) {
          console.error('Failed to load order from database:', err);
        }
      }
    }
    loadOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Retrieving order invoice...</p>
      </div>
    );
  }

  const { customer, items, pricing, payment } = order;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10 animate-bounce-in" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Verified & Dispatched
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Thank You For Your Acquisition
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Order <span className="font-mono text-indigo-600 font-bold">{order.id}</span> has been confirmed. A formal receipt and tracking link have been dispatched to {customer?.email || 'your email'}.
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 space-y-8 shadow-sm">
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Order Ref</span>
            <span className="font-mono font-bold text-slate-900 mt-0.5 block truncate">{order.id}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Timestamp</span>
            <span className="text-slate-700 font-medium mt-0.5 block">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Payment Method</span>
            <span className="text-indigo-600 font-bold mt-0.5 block">
              {order.payment_method || 'Razorpay Express'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Status</span>
            <span className="text-emerald-600 font-bold mt-0.5 block">
              {order.payment_status || 'Payment Confirmed'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Acquired Items
          </h3>
          <div className="space-y-3">
            {items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <img
                  src={item.thumbnail || item.image}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                />
                <div className="flex-1 truncate">
                  <h4 className="font-bold text-slate-900 truncate">{item.title || item.name}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Quantity: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                  </p>
                </div>
                <div className="text-right font-mono font-bold text-slate-900 text-sm">
                  {formatINR(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 block">Delivery Address</span>
            <p className="text-slate-600 leading-relaxed">
              {customer?.firstName} {customer?.lastName}<br />
              {customer?.address || order.shipping_address}<br />
              {customer?.city ? `${customer.city}, ${customer.state} - PIN: ${customer.zipCode}` : ''}<br />
              {customer?.country || 'India'}
            </p>
          </div>

          <div className="space-y-2 text-slate-600">
            <span className="font-bold text-slate-900 block">Financial Summary</span>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900 font-medium">{formatINR(pricing?.subtotal || order.total_amount)}</span>
            </div>
            {pricing?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span className="font-mono">-{formatINR(pricing.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pan-India Delivery</span>
              <span className="font-mono text-slate-900">
                {pricing?.shipping === 0 ? 'FREE' : formatINR(pricing?.shipping || 0)}
              </span>
            </div>
            {pricing?.tax > 0 && (
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="font-mono text-slate-900">{formatINR(pricing.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-100">
              <span>Amount Paid</span>
              <span className="font-mono text-indigo-600 text-base">{formatINR(pricing?.total || order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
          >
            <Printer className="w-4 h-4" /> Print GST Tax Invoice
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/profile"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition-colors border border-slate-200"
            >
              Order History
            </Link>
            <Link
              to="/products"
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
