import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthUser, SignIn, isClerkValid } from '../context/AuthContext';
import { Sparkles, ShieldCheck, ArrowRight, UserCheck, Key, Lock, Mail } from 'lucide-react';

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/profile';
  const isFromCheckout = redirectUrl === '/checkout';

  const { isClerkEnabled, loginDemo } = useAuthUser();
  const [email, setEmail] = useState('collector@aura-luxe.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    loginDemo('buyer');
    navigate(redirectUrl);
  };

  const handleQuickDemo = (role) => {
    loginDemo(role);
    navigate(redirectUrl);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-indigo-100/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        
        {isFromCheckout && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Sign in required to complete purchase</span>
              <span className="text-slate-600">Sign in or create an account to store your order securely and proceed with Razorpay.</span>
            </div>
          </div>
        )}

        <div className="text-center mb-8 space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-slate-900">AURA LUXE</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            {isFromCheckout ? 'Sign In to Proceed to Payment' : 'Welcome Back to Your Account'}
          </h1>
          <p className="text-xs text-slate-500">
            {isFromCheckout
              ? 'Your cart is saved. You will be redirected straight to Razorpay checkout.'
              : 'Sign in to access your curated orders and wishlist'}
          </p>
        </div>

        {isClerkValid ? (
          <div className="flex justify-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
              fallbackRedirectUrl={redirectUrl}
              forceRedirectUrl={redirectUrl}
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                Instant Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('buyer')}
                  className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Alex (Buyer)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('vip')}
                  className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Jordan (VIP)
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider absolute">
                or with credentials
              </span>
            </div>

            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 pl-9 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer font-medium">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 pl-9 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign In to Account <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Don't have an account yet?{' '}
              <Link to="/sign-up" className="text-indigo-600 font-bold hover:underline">
                Create an Account
              </Link>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Authentication Ready
              </div>
              <p>
                Add <code className="text-slate-800 font-mono text-[10px]">VITE_CLERK_PUBLISHABLE_KEY</code> in <code className="text-slate-800 font-mono text-[10px]">Client/.env</code> to switch to live Clerk OAuth & Email OTP.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
