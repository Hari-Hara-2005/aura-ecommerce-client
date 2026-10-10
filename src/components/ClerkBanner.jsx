import React, { useState } from 'react';
import { useAuthUser } from '../context/AuthContext';
import { KeyRound, ShieldCheck, X, ChevronRight, ExternalLink } from 'lucide-react';

export default function ClerkBanner() {
  const { isClerkEnabled } = useAuthUser();
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (dismissed || isClerkEnabled) return null;

  return (
    <>
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-xs text-indigo-900 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span className="font-bold text-indigo-950">Interactive Demo Mode:</span>
          <span className="text-slate-600 truncate font-medium">
            Clerk Auth & Razorpay are ready. Add your keys to <code className="bg-indigo-100 text-indigo-900 px-1 py-0.5 rounded font-mono font-semibold">Client/.env</code> for live production.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="text-indigo-700 hover:text-indigo-900 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            Setup Guide <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Clerk & Razorpay Integration</h3>
                <p className="text-xs text-slate-500">Environment Configuration Instructions</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" /> 1. Clerk Authentication
                  </span>
                  <a
                    href="https://dashboard.clerk.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
                  >
                    Get Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-500">
                  Open <code className="text-indigo-700 font-mono font-semibold">Client/.env</code> and paste your publishable key:
                </p>
                <pre className="bg-white p-2 rounded text-xs font-mono text-emerald-700 overflow-x-auto border border-slate-200">
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" /> 2. Razorpay Payment Gateway
                  </span>
                  <a
                    href="https://dashboard.razorpay.com/#/app/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold"
                  >
                    Get Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-500">
                  Add your Razorpay Test Key ID to <code className="text-purple-700 font-mono font-semibold">Client/.env</code>:
                </p>
                <pre className="bg-white p-2 rounded text-xs font-mono text-emerald-700 overflow-x-auto border border-slate-200">
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" /> 3. Backend Axios API
                </span>
                <p className="text-xs text-slate-500">
                  Configured to your Express & Neon backend:
                </p>
                <pre className="bg-white p-2 rounded text-xs font-mono text-emerald-700 overflow-x-auto border border-slate-200">
VITE_API_BASE_URL=http://localhost:5000/api
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
