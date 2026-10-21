import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuthUser } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Zap,
  ArrowLeft,
  Share2,
  MessageSquarePlus,
  Ban,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { formatINR } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, showToast } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isSignedIn } = useAuthUser();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

  const [reviewsList, setReviewsList] = useState([]);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/product/${id}`);
      const raw = response.data?.data || response.data;

      if (raw && (raw.id || raw.name || raw.title)) {
        const item = {
          ...raw,
          id: raw.id,
          title: raw.name || raw.title || 'Product',
          name: raw.name || raw.title || 'Product',
          description: raw.description || '',
          price: Number(raw.price || 0),
          stock: raw.stock !== undefined ? Number(raw.stock) : 0,
          image: raw.image || '',
          images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : (raw.image ? [raw.image] : []),
          thumbnail: raw.thumbnail || raw.image || (Array.isArray(raw.images) && raw.images[0]) || '',
          rating: raw.rating ? Number(raw.rating) : 5.0,
          category: raw.category_name || raw.category || 'Collection',
          brand: raw.brand || 'AURA',
          colors: Array.isArray(raw.colors) ? raw.colors : [],
          sizes: Array.isArray(raw.sizes) ? raw.sizes : [],
        };

        setProduct(item);
        const images = item.images.length > 0 ? item.images : [item.image || ''];
        setActiveImage(images[0] || '');
        setSelectedColor(item.colors?.[0] || '');
        setSelectedSize(item.sizes?.[0] || '');
        setReviewsList(item.reviews || []);
      } else {
        setProduct(null);
      }

      try {
        const relatedRes = await axios.get('http://localhost:5000/api/product');
        const allProducts = relatedRes.data?.data || relatedRes.data || [];
        if (Array.isArray(allProducts)) {
          const formatted = allProducts
            .filter((p) => String(p.id) !== String(id))
            .slice(0, 4)
            .map((p) => ({
              ...p,
              id: p.id,
              title: p.name || p.title || 'Product',
              name: p.name || p.title || 'Product',
              description: p.description || '',
              price: Number(p.price || 0),
              stock: p.stock !== undefined ? Number(p.stock) : 0,
              thumbnail: p.image || p.thumbnail || '',
              rating: p.rating ? Number(p.rating) : 4.8,
              category: p.category_name || p.category || 'Curated',
            }));
          setRelatedProducts(formatted);
        }
      } catch {}
    } catch (err) {
      console.error('Failed to load product detail:', err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-5">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">The requested piece is unavailable or does not exist.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/20"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </Link>
      </div>
    );
  }

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

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, { color: selectedColor, size: selectedSize });
    if (!isSignedIn) {
      navigate('/sign-in?redirect_url=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard', 'info');
    }
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;

    const newRev = {
      reviewerName: reviewerName.trim(),
      rating: reviewerRating,
      comment: reviewerComment.trim(),
      date: new Date().toISOString(),
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewerName('');
    setReviewerComment('');
    showToast('Review submitted successfully!', 'success');
  };

  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.thumbnail || product.image || ''];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors capitalize">
            {product.category || 'Products'}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium truncate max-w-xs">{product.title}</span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 relative shadow-sm">
            <img
              src={activeImage}
              alt={product.title}
              className={`w-full h-full object-cover object-center transition-all duration-300 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
            />
            {isOutOfStock ? (
              <span className="absolute top-4 left-4 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/30">
                Out of Stock
              </span>
            ) : discountPercent > 0 ? (
              <span className="absolute top-4 left-4 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl shadow-md">
                Save {discountPercent}%
              </span>
            ) : null}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImage === img
                      ? 'border-violet-600 shadow-md shadow-violet-500/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                {product.brand || 'AURA LUXURY'}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-slate-900 dark:text-white font-bold">{product.rating ? Number(product.rating).toFixed(1) : '4.9'}</span>
                <span className="text-slate-400 font-normal">({reviewsList.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
                {formatINR(product.price)}
              </span>
              {originalPrice && (
                <span className="text-base text-slate-400 line-through font-mono">
                  {formatINR(originalPrice)}
                </span>
              )}
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  In Stock ({product.stock !== undefined ? product.stock : 18} units ready)
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Finish: <span className="text-slate-900 dark:text-white">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
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
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Size / Configuration: <span className="text-slate-900 dark:text-white">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
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
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-rose-600 dark:text-rose-400">Piece Currently Unavailable</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  This product is sold out and undergoing inventory restock.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <div className={`flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-1.5 shrink-0 ${isOutOfStock ? 'opacity-50' : ''}`}>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={`p-1 text-slate-500 transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer'}`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-slate-900 dark:text-white font-mono">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className={`p-1 text-slate-500 transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer'}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white cursor-pointer shadow-lg shadow-violet-500/25'
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
                    <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isFavorited
                    ? 'border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500 hover:border-rose-500'
                }`}
                title={isFavorited ? 'Remove wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                isOutOfStock
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none'
                  : 'bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white cursor-pointer shadow-md'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <Ban className="w-4 h-4" /> Direct Checkout Disabled
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" /> Buy Now with Instant Razorpay Checkout
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <Truck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-900 dark:text-white">Free Delivery</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Over ₹999</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-violet-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-900 dark:text-white">Razorpay Secure</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">UPI / Cards</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <RotateCcw className="w-4 h-4 text-sky-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-900 dark:text-white">7-Day Returns</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Pan-India Support</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-12 space-y-8">
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Technical Specifications & Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Client Reviews ({reviewsList.length})
          </button>
        </div>

        {activeTab === 'specs' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-3 backdrop-blur-xl shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Key Attributes</h3>
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Designation</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{product.title}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Department</span>
                  <span className="font-semibold text-violet-600 dark:text-violet-400 capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Brand House</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{product.brand || 'AURA'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">SKU Identifier</span>
                  <span className="font-mono text-violet-600 dark:text-violet-400 font-bold">AUR-{product.id}-X</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-3 backdrop-blur-xl shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Materials & Handling</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Handcrafted using aerospace titanium alloy, sapphire glass, or 100% fine Indian combed cotton depending on item classification. Inspect according to bespoke preservation instructions.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <form onSubmit={handleAddReview} className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-4 max-w-xl backdrop-blur-xl shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Write a Verified Client Review
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Julian Hayes"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Score</label>
                  <select
                    value={reviewerRating}
                    onChange={(e) => setReviewerRating(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-violet-500 transition-colors cursor-pointer"
                  >
                    <option value={5}>5 Stars - Flawless</option>
                    <option value={4}>4 Stars - Excellent</option>
                    <option value={3}>3 Stars - Good</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  placeholder="Share details on finish, delivery, and satisfaction..."
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-violet-500/25 transition-all cursor-pointer"
              >
                Publish Review
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviewsList.length === 0 ? (
                <div className="col-span-full p-6 text-center rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 text-xs">
                  No verified client reviews yet. Submit your feedback using the form above!
                </div>
              ) : (
                reviewsList.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{rev.reviewerName}</span>
                      <div className="flex text-amber-500 text-xs">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-16 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recommended Complements</h2>
            <Link to="/products" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
              Browse More →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
