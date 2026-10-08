import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast, closeToast } = useCart();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm w-full">
      <div className={`p-4 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 transition-all ${
        isSuccess
          ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-500/10'
          : isError
          ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-500/10'
          : 'bg-slate-900/95 border-indigo-500/40 text-slate-100 shadow-indigo-500/10'
      }`}>
        <div className="shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-400" />}
        </div>
        <p className="text-sm font-medium flex-1 text-slate-200">{toast.message}</p>
        <button
          onClick={closeToast}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
