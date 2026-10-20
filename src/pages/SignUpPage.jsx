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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-purple-100/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        
        {isFromCheckout && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Create an account to complete order</span>
              <span className="text-slate-600">Registering stores your order securely so you can track delivery and receive Razorpay receipts.</span>
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
            {isFromCheckout ? 'Register to Proceed to Payment':'Create your account'}
          </h1>
          <p className="text-xs text-slate-500">
            {isFromCheckout
              ? 'Your cart items are saved. You will return directly to checkout.'
              : 'Create an account to gain priority drops & express checkout'}
          </p>
        </div>

        {isClerkValid ? (
          <div className="flex justify-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
              fallbackRedirectUrl={redirectUrl}
              forceRedirectUrl={redirectUrl}
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Julian Hayes"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 pl-9 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="julian@example.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 pl-9 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 pl-9 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                By joining, you agree to AURA's Terms of Atelier Service and Luxury Privacy Standards.
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Create My Account <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Already have an account?{' '}
              <Link to="/sign-in" className="text-indigo-600 font-bold hover:underline">
                Sign In
              </Link>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Authentication Integrated
              </div>
              <p>
                Add your <code className="text-slate-800 font-mono text-[10px]">VITE_CLERK_PUBLISHABLE_KEY</code> in <code className="text-slate-800 font-mono text-[10px]">Client/.env</code> to render live Clerk Sign Up components automatically.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
