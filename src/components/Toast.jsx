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
          ? 'bg-white border-emerald-200 text-slate-900 shadow-emerald-500/10'
          : isError
          ? 'bg-white border-rose-200 text-slate-900 shadow-rose-500/10'
          : 'bg-white border-indigo-200 text-slate-900 shadow-indigo-500/10'
      }`}>
        <div className="shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-600" />}
        </div>
        <p className="text-sm font-semibold flex-1 text-slate-800">{toast.message}</p>
        <button
          onClick={closeToast}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
