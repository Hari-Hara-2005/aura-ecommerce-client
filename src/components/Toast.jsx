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
      <div className="p-4 rounded-xl shadow-xl bg-black text-white border border-neutral-800 flex items-center gap-3 transition-all">
        <div className="shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-white" />}
          {isError && <AlertCircle className="w-5 h-5 text-white" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-white" />}
        </div>
        <p className="text-sm font-medium flex-1 text-white">{toast.message}</p>
        <button
          onClick={closeToast}
          className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
