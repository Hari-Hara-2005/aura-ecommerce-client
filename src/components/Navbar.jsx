import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuthUser, UserButton, SignedIn } from '../context/AuthContext';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Sparkles,
  LogOut,
  Package,
  ArrowRight,
  User,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isSignedIn, isClerkEnabled, signOut } = useAuthUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productService
      .getCategories()
      .then((cats) => {
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'All Products', path: '/products' },
    ...categories.map((c) => {
      const name = typeof c === 'object' ? c.name : c;
      return {
        label: name,
        path: `/products?category=${encodeURIComponent(name)}`,
      };
    }),
    { label: 'Orders', path: '/orders' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#090D1A]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white transition-all group-hover:scale-105 shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-wider text-slate-900 dark:text-white font-display">
                AURA
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-indigo-600 dark:text-indigo-400 -mt-1">
                Luxe Collective
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path.includes('?') && location.search.includes(link.path.split('?')[1]));
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'text-indigo-600 dark:text-white bg-indigo-50 dark:bg-slate-800/90 border border-indigo-200 dark:border-slate-700/80 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative flex-1 max-w-xs xl:max-w-sm"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search perfumes, watches, phones..."
              className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2 transition-all outline-none font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/orders"
              className={`relative p-2.5 rounded-xl transition-all ${
                location.pathname === '/orders'
                  ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title="My Orders & Tracking"
            >
              <Package className="w-5 h-5" />
            </Link>

            <Link
              to="/products"
              className="relative p-2.5 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md shadow-rose-500/30">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer group"
              title="Open cart drawer"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/30">
                  {itemCount}
                </span>
              )}
            </button>

            <ThemeToggle />

            <div className="relative">
              {isSignedIn ? (
                user?.id && !user.id.startsWith('usr_demo_') && isClerkEnabled ? (
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                    >
                      <img
                        src={user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80'}
                        alt={user?.fullName || 'User'}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-300 dark:border-slate-700"
                      />
                      <span className="hidden xl:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {user?.firstName || 'Account'}
                      </span>
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in text-sm backdrop-blur-xl">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.fullName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                        <Link
                          to="/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors font-medium"
                        >
                          <Package className="w-4 h-4 text-indigo-500" /> My Orders & Tracking
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors font-medium"
                        >
                          <User className="w-4 h-4 text-indigo-500" /> Account Profile
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors text-left cursor-pointer font-medium mt-1"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/sign-in"
                    className="text-xs font-semibold px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition-all shadow-md shadow-indigo-600/25"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-b-2xl px-4 mb-2 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg flex items-center justify-between"
                >
                  {link.label}
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </Link>
              ))}
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg flex items-center justify-between"
              >
                Order History & Tracking
                <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg flex items-center justify-between"
              >
                Shopping Bag ({itemCount})
                <ShoppingBag className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg flex items-center justify-between"
              >
                My Account & Orders
                <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </Link>
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Appearance Mode</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
