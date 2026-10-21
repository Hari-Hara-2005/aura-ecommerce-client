import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../utils/format';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  Check,
  Truck,
  ArrowRight,
  Ban,
  AlertCircle,
} from 'lucide-react';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.thumbnail || product.image || ''];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Default');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const discountPercent = Math.round(product.discountPercentage || 0);
  const originalPrice = discountPercent > 0
    ? (product.price / (1 - discountPercent / 100)).toFixed(2)
    : null;

  const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, { color: selectedColor, size: selectedSize });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-slate-900 dark:text-slate-100">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl z-10 overflow-hidden backdrop-blur-xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 relative">
              <img
                src={activeImage}
                alt={product.title}
                className={`w-full h-full object-cover object-center transition-all duration-300 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
              />
              {isOutOfStock ? (
                <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/30 flex items-center gap-2">
                  Out of Stock
                </span>
              ) : discountPercent > 0 ? (
                <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl shadow-md">
                  -{discountPercent}% OFF
                </span>
              ) : null}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImage === img
                        ? 'border-violet-600 shadow-md shadow-violet-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold tracking-widest text-violet-600 dark:text-violet-400">
                  {product.brand || product.category || 'AURA LUXURY'}
                </span>
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-slate-900 dark:text-white font-bold">{product.rating ? Number(product.rating).toFixed(1) : '4.9'}</span>
                  <span className="text-slate-400 font-normal">({product.reviews?.length || 42} reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {product.title}
              </h2>

              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {formatINR(product.price)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    {formatINR(originalPrice)}
                  </span>
                )}
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    In Stock ({product.stock !== undefined ? product.stock : 12} left)
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Finish: <span className="text-slate-900 dark:text-white font-bold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        selectedColor === c
                          ? 'border-violet-600 bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-violet-500'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Size: <span className="text-slate-900 dark:text-white font-bold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'border-violet-600 bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-violet-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isOutOfStock && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>This piece is currently out of stock.</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <div className={`flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 px-2 py-1 shrink-0 ${isOutOfStock ? 'opacity-50' : ''}`}>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={`p-1.5 text-slate-500 transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer'}`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-900 dark:text-white font-mono">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className={`p-1.5 text-slate-500 transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer'}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 cursor-pointer'
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <Ban className="w-4 h-4" /> Out of Stock
                  </>
                ) : added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isFavorited
                    ? 'border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500 hover:border-rose-500'
                }`}
                title={isFavorited ? 'Saved' : 'Save'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-500" /> Free Express Delivery
              </span>
              <Link
                to={`/products/${product.id}`}
                onClick={onClose}
                className="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 hover:underline"
              >
                View Full Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
