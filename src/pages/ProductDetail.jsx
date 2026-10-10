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
              image: p.image,
              images: p.image ? [p.image] : [],
              rating: p.rating ? Number(p.rating) : 5.0,
              category: p.category_name || p.category || 'Collection',
            }));
          setRelatedProducts(formatted);
        }
      } catch (relatedErr) {
        console.warn("Could not fetch complement products:", relatedErr.message);
      }
    } catch (error) {
      console.error("Failed to fetch product from API:", error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Curating item specifications via API...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Product not located</h2>
        <Link to="/products" className="text-indigo-600 hover:underline text-sm font-semibold">
          Return to collections
        </Link>
      </div>
    );
  }

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

  const handleBuyNow = () => {
    addToCart(product, quantity, { color: selectedColor, size: selectedSize });
    if (!isSignedIn) {
      navigate('/sign-in?redirect_url=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (reviewerName.trim() && reviewerComment.trim()) {
      const newRev = {
        reviewerName: reviewerName.trim(),
        rating: reviewerRating,
        comment: reviewerComment.trim(),
        date: new Date().toLocaleDateString(),
      };
      setReviewsList([newRev, ...reviewsList]);
      setReviewerName('');
      setReviewerComment('');
      showToast('Thank you! Your verified review has been published.', 'success');
    }
  };

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.thumbnail || product.image || activeImage];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-slate-900 transition-colors capitalize">
            {product.category || 'Products'}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{product.title}</span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80 relative shadow-sm">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-rose-500 text-white rounded-xl shadow-md">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImage === img
                      ? 'border-indigo-600 ring-4 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                {product.brand || 'AURA ATELIER'}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating ? Number(product.rating).toFixed(1) : '4.9'}</span>
                <span className="text-slate-400 font-normal">({reviewsList.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-4xl font-extrabold text-slate-900 font-mono">
                {formatINR(product.price)}
              </span>
              {originalPrice && (
                <span className="text-base text-slate-400 line-through font-mono">
                  {formatINR(originalPrice)}
                </span>
              )}
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                In Stock ({product.stock || 18} units ready)
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Finish: <span className="text-indigo-600">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedColor === c
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Size / Configuration: <span className="text-indigo-600">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedSize === s
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-3 py-1.5 shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-slate-900 font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" /> Added to Cart!
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
                    ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={isFavorited ? 'Remove wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" /> Buy Now with Instant Razorpay Checkout
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <Truck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-900">Free Delivery</div>
              <div className="text-[10px] text-slate-500">Over ₹999</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-900">Razorpay Secure</div>
              <div className="text-[10px] text-slate-500">UPI / Cards / NetBanking</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <RotateCcw className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-900">7-Day Returns</div>
              <div className="text-[10px] text-slate-500">Pan-India Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-slate-200 pt-12 space-y-8">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Technical Specifications & Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Client Reviews ({reviewsList.length})
          </button>
        </div>

        {activeTab === 'specs' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-base">Key Attributes</h3>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Designation</span>
                  <span className="font-semibold text-slate-900">{product.title}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Department</span>
                  <span className="font-semibold text-slate-900 capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Brand House</span>
                  <span className="font-semibold text-slate-900">{product.brand || 'AURA'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">SKU Identifier</span>
                  <span className="font-mono text-indigo-600 font-bold">AUR-{product.id}-X</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-base">Materials & Handling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Handcrafted using aerospace titanium alloy, sapphire glass, or 100% fine Indian combed cotton depending on item classification. Inspect according to bespoke preservation instructions.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <form onSubmit={handleAddReview} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 max-w-xl">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-indigo-600" /> Write a Verified Client Review
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Julian Hayes"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Score</label>
                  <select
                    value={reviewerRating}
                    onChange={(e) => setReviewerRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  >
                    <option value={5}>5 Stars - Flawless</option>
                    <option value={4}>4 Stars - Excellent</option>
                    <option value={3}>3 Stars - Good</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  placeholder="Share details on finish, delivery, and satisfaction..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Publish Review
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviewsList.length === 0 ? (
                <div className="col-span-full p-6 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                  No verified client reviews yet. Submit your feedback using the form above!
                </div>
              ) : (
                reviewsList.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{rev.reviewerName}</span>
                      <div className="flex text-amber-500 text-xs">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-200 pt-16 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Recommended Complements</h2>
            <Link to="/products" className="text-xs font-bold text-indigo-600 hover:underline">
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
