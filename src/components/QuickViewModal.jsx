import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.thumbnail];

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

  const handleAddToCart = () => {
    addToCart(product, quantity, { color: selectedColor, size: selectedSize });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Gallery View */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-rose-500 text-white rounded-lg">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Selectors */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
                  {product.brand || product.category || 'AURA COLLECTION'}
                </span>
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating ? Number(product.rating).toFixed(1) : '4.9'}</span>
                  <span className="text-slate-500 font-normal">({product.reviews?.length || 42} verified reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white leading-tight">
                {product.title}
              </h2>

              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-extrabold text-white font-mono">
                  ${Number(product.price).toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-slate-500 line-through font-mono">
                    ${originalPrice}
                  </span>
                )}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  In Stock ({product.stock || 12} left)
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Colors picker if available */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Finish: <span className="text-indigo-400">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        selectedColor === c
                          ? 'border-indigo-500 bg-indigo-500/15 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes picker if available */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Size: <span className="text-indigo-400">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        selectedSize === s
                          ? 'border-indigo-500 bg-indigo-500/15 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950/80 px-2 py-1 shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-white font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isFavorited
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
                title={isFavorited ? 'Saved' : 'Save'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* View Full Page Link */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-400" /> Free 2-3 Day Delivery
              </span>
              <Link
                to={`/products/${product.id}`}
                onClick={onClose}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
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
