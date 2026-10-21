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
      <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2 text-xs text-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="flex h-2 w-2 rounded-full bg-black shrink-0" />
          <span className="font-bold text-neutral-950">Demo Mode:</span>
          <span className="text-neutral-600 truncate font-medium">
            Clerk Auth & Razorpay configured. Add keys to <code className="bg-neutral-200 text-neutral-900 px-1 py-0.5 rounded font-mono font-semibold">Client/.env</code> for production.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="text-neutral-900 hover:text-black underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            Setup Guide <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in text-neutral-900">
          <div className="bg-white border border-neutral-300 rounded-xl p-6 max-w-lg w-full shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">Clerk & Razorpay Integration</h3>
                <p className="text-xs text-neutral-500">Environment Configuration Instructions</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-neutral-700">
              <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-black" /> 1. Clerk Authentication
                  </span>
                  <a
                    href="https://dashboard.clerk.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-black hover:underline flex items-center gap-1 font-semibold"
                  >
                    Get Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-neutral-500">
                  Open <code className="text-black font-mono font-semibold">Client/.env</code> and paste your publishable key:
                </p>
                <pre className="bg-white p-2 rounded text-xs font-mono text-neutral-900 overflow-x-auto border border-neutral-200">
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-black" /> 2. Razorpay Payment Gateway
                  </span>
                  <a
                    href="https://dashboard.razorpay.com/#/app/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-black hover:underline flex items-center gap-1 font-semibold"
                  >
                    Get Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-neutral-500">
                  Add your Razorpay Test Key ID to <code className="text-black font-mono font-semibold">Client/.env</code>:
                </p>
                <pre className="bg-white p-2 rounded text-xs font-mono text-neutral-900 overflow-x-auto border border-neutral-200">
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="font-semibold text-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-black" /> 3. Backend Axios API
                </span>
                <p className="text-xs text-neutral-500">
                  Configured to your Express & Neon backend:
                </p>
                <pre className="bg-white p-2 rounded text-xs font-mono text-neutral-900 overflow-x-auto border border-neutral-200">
VITE_API_BASE_URL=http://localhost:5000/api
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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
