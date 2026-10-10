import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, ShoppingBag, Star, Eye, Check } from 'lucide-react';
import { formatINR } from '../utils/format';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const discountPercent = Math.round(product.discountPercentage || 0);
  const originalPrice = discountPercent > 0 
    ? (product.price / (1 - discountPercent / 100))
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <div className="group relative rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 flex flex-col overflow-hidden">
      
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.thumbnail || product.image || product.images?.[0]}
            alt={product.title || product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-rose-500 text-white rounded-lg shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.stock && product.stock <= 5 && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-lg shadow-sm">
              Low Stock
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleWishlistClick}
            className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-sm ${
              isFavorited
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white border border-slate-200/80'
            }`}
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleQuickViewClick}
            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-sm"
            title="Quick preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="uppercase tracking-wider text-[10px] font-bold text-indigo-600">
              {product.category || 'Collection'}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold text-slate-700 text-xs">
                {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
              </span>
            </div>
          </div>

          <Link
            to={`/products/${product.id}`}
            className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors"
          >
            {product.title}
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 font-mono">
              {formatINR(product.price)}
            </span>
            {originalPrice && (
              <span className="text-xs text-slate-400 line-through font-mono">
                {formatINR(originalPrice)}
              </span>
            )}
          </div>

          <Link
            to={`/products/${product.id}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
