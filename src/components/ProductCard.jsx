import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, ShoppingBag, Star, Eye, Check, Ban } from 'lucide-react';
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

  const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;
  const isLowStock = !isOutOfStock && product.stock !== undefined && Number(product.stock) > 0 && Number(product.stock) <= 5;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
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
    <div className="group relative rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-sm">
      
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950/80">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.thumbnail || product.image || product.images?.[0]}
            alt={product.title || product.name}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-105 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
            loading="lazy"
          />
        </Link>

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg backdrop-blur-md">
              Out of Stock
            </span>
          ) : (
            <>
              {discountPercent > 0 && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg backdrop-blur-md shadow-sm">
                  -{discountPercent}%
                </span>
              )}
              {isLowStock && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg backdrop-blur-md">
                  Low Stock
                </span>
              )}
            </>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleWishlistClick}
            className={`p-2 rounded-xl transition-all cursor-pointer backdrop-blur-md ${
              isFavorited
                ? 'bg-rose-600 text-white border border-rose-500 shadow-md shadow-rose-600/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80'
            }`}
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleQuickViewClick}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Quick preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/90 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed select-none border border-slate-800"
            >
              <Ban className="w-3.5 h-3.5 text-slate-500" /> Unavailable
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="uppercase tracking-wider text-[10px] font-bold text-indigo-400">
              {product.category || 'Collection'}
            </span>
            {isOutOfStock ? (
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Out of Stock
              </span>
            ) : (
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-200 text-xs">
                  {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
                </span>
              </div>
            )}
          </div>

          <Link
            to={`/products/${product.id}`}
            className="text-sm font-semibold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors block"
          >
            {product.title}
          </Link>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-white font-mono">
              {formatINR(product.price)}
            </span>
            {originalPrice && (
              <span className="text-xs text-slate-500 line-through font-mono">
                {formatINR(originalPrice)}
              </span>
            )}
          </div>

          <Link
            to={`/products/${product.id}`}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
