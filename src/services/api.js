import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aura_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('[API Client Warning]:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const FALLBACK_PRODUCTS = [
  {
    id: 101,
    title: 'AURA CyberSphere Studio Wireless Headphones',
    description: 'Flagship active noise cancellation, spatial audio calibration with 40-hour battery life and custom titanium acoustic drivers.',
    price: 349.99,
    discountPercentage: 15,
    rating: 4.9,
    stock: 24,
    brand: 'AURA Audio',
    category: 'electronics',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['wireless', 'headphones', 'sound', 'luxury'],
    colors: ['Obsidian Black', 'Lunar Silver', 'Cosmic Indigo'],
    sizes: ['Standard']
  },
  {
    id: 102,
    title: 'Chronos Luminary Obsidian Ceramic Watch',
    description: 'Precision sapphire crystal automatic mechanical chronograph with aerospace-grade ceramic case and waterproof 100m resistance.',
    price: 899.00,
    discountPercentage: 20,
    rating: 4.95,
    stock: 9,
    brand: 'Chronos Geneva',
    category: 'watches',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['luxury', 'watch', 'chronograph', 'automatic'],
    colors: ['Ceramic Black', 'Silver Frost', 'Rose Gold'],
    sizes: ['40mm', '42mm']
  },
  {
    id: 103,
    title: 'Verve Minimalist Sculpted Wool Trench Coat',
    description: 'Hand-tailored Italian double-faced cashmere wool coat designed with modern oversized silhouette and hidden horn button closure.',
    price: 495.00,
    discountPercentage: 10,
    rating: 4.85,
    stock: 14,
    brand: 'Verve Atelier',
    category: 'fashion',
    thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['fashion', 'coat', 'winter', 'wool'],
    colors: ['Camel Beige', 'Midnight Black', 'Slate Grey'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 104,
    title: 'Aether Mirage Mirrorless 4K Cinema Camera',
    description: 'Full-frame 61MP BSI sensor with 8K 30fps HDR video, cinematic color grading profile, and ultra-fast dual pixel autofocus.',
    price: 1999.00,
    discountPercentage: 12,
    rating: 4.92,
    stock: 6,
    brand: 'Aether Optical',
    category: 'electronics',
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['camera', 'cinematic', 'photo', 'electronics'],
    colors: ['Matte Black'],
    sizes: ['Body Only', 'Body + 24-70mm Lens']
  },
  {
    id: 105,
    title: 'Solstice Botanical Eau De Parfum 100ml',
    description: 'Rare bourbon vanilla infused with bergamot blossom, smoked sandalwood and amber resin. Long lasting 18-hour projection.',
    price: 185.00,
    discountPercentage: 5,
    rating: 4.88,
    stock: 35,
    brand: 'Maison Solstice',
    category: 'fragrance',
    thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['perfume', 'luxury', 'fragrance', 'scent'],
    colors: ['Amber Gold'],
    sizes: ['50ml', '100ml']
  },
  {
    id: 106,
    title: 'Acrobat Swift Carbon Fiber Road Runner',
    description: 'Propulsive carbon plate performance sneakers with breathable matrix mesh upper and high-energy nitrogen rebound foam.',
    price: 220.00,
    discountPercentage: 18,
    rating: 4.79,
    stock: 19,
    brand: 'Acrobat Athletics',
    category: 'footwear',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['sneakers', 'running', 'footwear', 'carbon'],
    colors: ['Crimson Blaze', 'Triple Black', 'Cyber Neon'],
    sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12']
  },
  {
    id: 107,
    title: 'Elysian Full-Grain Italian Leather Weekender Bag',
    description: 'Artisan vegetable-tanned full-grain leather luggage with water-resistant cotton lining, laptop sleeve, and brass hardware.',
    price: 430.00,
    discountPercentage: 15,
    rating: 4.93,
    stock: 11,
    brand: 'Elysian Leather',
    category: 'fashion',
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['leather', 'bag', 'travel', 'duffel'],
    colors: ['Cognac Tan', 'Espresso Dark Brown', 'Jet Black'],
    sizes: ['45 Liters']
  },
  {
    id: 108,
    title: 'Nova Acoustic High-Fidelity Desktop Speaker',
    description: 'Dual walnut wooden enclosure bookshelf speakers with aptX HD Bluetooth 5.3, optical digital inputs and punchy studio bass.',
    price: 380.00,
    discountPercentage: 8,
    rating: 4.86,
    stock: 17,
    brand: 'Nova Acoustic',
    category: 'electronics',
    thumbnail: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['speaker', 'audio', 'sound', 'walnut'],
    colors: ['Walnut Wood', 'Black Ash', 'Natural Birch'],
    sizes: ['Pair']
  }
];

export const productService = {
  async getProducts({ limit = 30, skip = 0, category, search, sortBy, order } = {}) {
    try {
      if (search && search.trim() !== '') {
        const response = await apiClient.get(`/products/search?q=${encodeURIComponent(search)}`);
        return response.data;
      }
      
      let endpoint = `/products?limit=${limit}&skip=${skip}`;
      if (category && category !== 'all') {
        endpoint = `/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
      }
      if (sortBy) {
        endpoint += `&sortBy=${sortBy}&order=${order || 'asc'}`;
      }

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.warn('[productService.getProducts] Fallback to internal products due to network/API status:', error.message);
      let results = [...FALLBACK_PRODUCTS];
      if (category && category !== 'all') {
        results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      return {
        products: results,
        total: results.length,
        skip: 0,
        limit: results.length
      };
    }
  },

  async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`[productService.getProductById] Fallback for ID ${id}:`, error.message);
      const fallback = FALLBACK_PRODUCTS.find(p => p.id === Number(id)) || FALLBACK_PRODUCTS[0];
      return fallback;
    }
  },

  async getCategories() {
    try {
      const response = await apiClient.get('/products/categories');
      const raw = response.data;
      if (Array.isArray(raw)) {
        return raw.map(cat => (typeof cat === 'object' ? cat.slug || cat.name : cat));
      }
      return ['smartphones', 'laptops', 'fragrances', 'skincare', 'groceries', 'home-decoration', 'furniture', 'tops', 'womens-dresses'];
    } catch (error) {
      console.warn('[productService.getCategories] Using fallback categories');
      return ['electronics', 'watches', 'fashion', 'fragrance', 'footwear'];
    }
  },
};

export const orderService = {
  async createOrder(orderPayload) {
    try {
      console.log('[orderService.createOrder] Sending order to backend API:', orderPayload);
      const response = await apiClient.post('/orders', orderPayload);
      const createdOrder = response.data?.order || response.data;
      
      const savedOrders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
      savedOrders.unshift(createdOrder);
      localStorage.setItem('aura_orders', JSON.stringify(savedOrders));

      return createdOrder;
    } catch (error) {
      console.warn('[orderService.createOrder] Falling back to local persistence:', error.message);
      const dummyOrderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 8999 + 1000);
      const createdOrder = {
        id: dummyOrderId,
        ...orderPayload,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      };
      
      const savedOrders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
      savedOrders.unshift(createdOrder);
      localStorage.setItem('aura_orders', JSON.stringify(savedOrders));

      return createdOrder;
    }
  },

  async verifyPayment(paymentDetails) {
    try {
      const res = await apiClient.post('/payment/verify', paymentDetails);
      return res.data;
    } catch (error) {
      console.warn('[orderService.verifyPayment] Local verification fallback:', error.message);
      return { success: true, verifiedAt: new Date().toISOString() };
    }
  },

  async getUserOrders(userId) {
    try {
      if (userId) {
        const res = await apiClient.get(`/orders/user/${userId}`);
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      }
    } catch (e) {
      console.warn('[orderService.getUserOrders] Fallback to local storage:', e.message);
    }
    try {
      return JSON.parse(localStorage.getItem('aura_orders') || '[]');
    } catch {
      return [];
    }
  }
};

export const couponService = {
  async validateCoupon(code, subtotal) {
    try {
      const res = await apiClient.post('/coupons/validate', { code, subtotal });
      return res.data;
    } catch (error) {
      const cleanCode = code?.toUpperCase().trim();
      if (cleanCode === 'AURA10') return { valid: true, discountAmount: subtotal * 0.1, code: 'AURA10', message: '10% OFF Applied' };
      if (cleanCode === 'LUXE20' && subtotal >= 200) return { valid: true, discountAmount: subtotal * 0.2, code: 'LUXE20', message: '20% OFF Applied' };
      if (cleanCode === 'FIRST50' && subtotal >= 150) return { valid: true, discountAmount: 50, code: 'FIRST50', message: '$50 OFF Applied' };
      throw error?.response?.data || { message: 'Invalid coupon code' };
    }
  }
};

export const userService = {
  async syncUser(userData) {
    try {
      const res = await apiClient.post('/users/sync', userData);
      return res.data;
    } catch (e) {
      console.warn('[userService.syncUser] Local cache fallback:', e.message);
      return null;
    }
  }
};
