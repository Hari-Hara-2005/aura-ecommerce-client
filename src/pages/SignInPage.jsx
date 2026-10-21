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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 dark:bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        
        {isFromCheckout && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-3 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block">Sign in required to complete purchase</span>
              <span className="opacity-90">Sign in or create an account to store your order securely and proceed with Razorpay.</span>
            </div>
          </div>
        )}

        <div className="text-center mb-8 space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl tracking-wider text-slate-900 dark:text-white">AURA LUXE</span>
          </Link>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {isFromCheckout ? 'Sign In to Proceed to Payment' : 'Welcome Back to Your Account'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isFromCheckout
              ? 'Your cart is saved. You will be redirected straight to Razorpay checkout.'
              : 'Sign in to access your curated orders and wishlist'}
          </p>
        </div>

        {isClerkValid ? (
          <div className="flex justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
              fallbackRedirectUrl={redirectUrl}
              forceRedirectUrl={redirectUrl}
            />
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Instant Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('buyer')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:border-violet-400/50 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Alex (Buyer)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('vip')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:border-violet-400/50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" /> Jordan (VIP)
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider absolute font-semibold">
                or with credentials
              </span>
            </div>
            
            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 pl-10 text-xs outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-violet-500 transition-all placeholder-slate-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <span className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline cursor-pointer font-medium">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 pl-10 text-xs outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-violet-500 transition-all placeholder-slate-400"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign In to Account <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Don't have an account yet?{' '}
              <Link to="/sign-up" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">
                Create an Account
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> Authentication Ready
              </div>
              <p>
                Add <code className="text-violet-600 dark:text-violet-400 font-mono text-[10px]">VITE_CLERK_PUBLISHABLE_KEY</code> in <code className="text-violet-600 dark:text-violet-400 font-mono text-[10px]">Client/.env</code> for Clerk OAuth.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
