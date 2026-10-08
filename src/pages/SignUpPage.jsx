import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthUser, SignUp, isClerkValid } from '../context/AuthContext';
import { Sparkles, ShieldCheck, ArrowRight, UserPlus, Lock, Mail, User } from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/profile';
  const isFromCheckout = redirectUrl === '/checkout';

  const { loginDemo } = useAuthUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginDemo('buyer');
    navigate(redirectUrl);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Checkout requirement banner if coming from cart/checkout */}
        {isFromCheckout && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-3 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Create an account to complete order</span>
              <span>Registering stores your order in Clerk so you can track delivery and receive Razorpay receipts.</span>
            </div>
          </div>
        )}

        {/* Brand header */}
        <div className="text-center mb-8 space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-white">AURA LUXE</span>
          </Link>
          <h1 className="text-xl font-bold text-white">
            {isFromCheckout ? 'Register to Proceed to Payment' : 'Join the Private Atelier'}
          </h1>
          <p className="text-xs text-slate-400">
            {isFromCheckout
              ? 'Your cart items are saved. You will return directly to checkout.'
              : 'Create an account to gain priority drops & express checkout'}
          </p>
        </div>

        {/* Clerk Component or Interactive Authentication Form */}
        {isClerkValid ? (
          <div className="flex justify-center bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
              fallbackRedirectUrl={redirectUrl}
              forceRedirectUrl={redirectUrl}
            />
          </div>
        ) : (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Julian Hayes"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 pl-9 text-xs outline-none focus:border-indigo-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="julian@example.com"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 pl-9 text-xs outline-none focus:border-indigo-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 pl-9 text-xs outline-none focus:border-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                By joining, you agree to AURA's Terms of Atelier Service and Luxury Privacy Standards.
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Create My Account <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Switch to sign in */}
            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              Already have an account?{' '}
              <Link to="/sign-in" className="text-indigo-400 font-bold hover:underline">
                Sign In
              </Link>
            </div>

            {/* Clerk info notice */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Clerk Auth Integrated
              </div>
              <p>
                Add your <code className="text-slate-300 font-mono text-[10px]">VITE_CLERK_PUBLISHABLE_KEY</code> in <code className="text-slate-300 font-mono text-[10px]">Client/.env</code> to render live Clerk Sign Up components automatically.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
