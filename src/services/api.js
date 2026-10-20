import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

export const productService = {
  async getProducts({ limit = 60, skip = 0, category, search, sortBy, order } = {}) {
    try {
      const response = await apiClient.get('/product');
      const rawList = response.data?.data || response.data || [];
      
      let results = (Array.isArray(rawList) ? rawList : []).map((p) => ({
        ...p,
        id: p.id,
        title: p.name || p.title || 'Product',
        name: p.name || p.title || 'Product',
        description: p.description || '',
        price: Number(p.price || 0),
        stock: p.stock !== undefined ? Number(p.stock) : 0,
        thumbnail: p.image || p.thumbnail || '',
        image: p.image || '',
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
        category: p.category_name || p.category || 'General',
        category_name: p.category_name || p.category,
        category_id: p.category_id,
        rating: p.rating ? Number(p.rating) : 5.0,
      }));

      if (category && category !== 'all') {
        const catQuery = category.toLowerCase().trim();
        results = results.filter(
          (p) =>
            p.category?.toLowerCase() === catQuery ||
            p.category_name?.toLowerCase() === catQuery ||
            p.category_id?.toLowerCase() === catQuery
        );
      }

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        results = results.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
      }

      if (sortBy === 'price-low') {
        results.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        results.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'name') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      }

      if (limit) {
        results = results.slice(skip, skip + limit);
      }

      return {
        products: results,
        total: results.length,
        skip,
        limit,
      };
    } catch (error) {
      console.error('[productService.getProducts] Failed to fetch live products:', error.message);
      return {
        products: [],
        total: 0,
        skip: 0,
        limit: 0,
      };
    }
  },

  async getProductById(id) {
    try {
      const response = await apiClient.get(`/product/${id}`);
      const raw = response.data?.data || response.data;
      if (raw) {
        return {
          ...raw,
          id: raw.id,
          title: raw.name || raw.title || 'Product',
          name: raw.name || raw.title || 'Product',
          description: raw.description || '',
          price: Number(raw.price || 0),
          stock: raw.stock !== undefined ? Number(raw.stock) : 0,
          thumbnail: raw.image || raw.thumbnail || '',
          image: raw.image || '',
          images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : (raw.image ? [raw.image] : []),
          category: raw.category_name || raw.category || 'General',
          category_id: raw.category_id,
          rating: raw.rating ? Number(raw.rating) : 5.0,
        };
      }
      return null;
    } catch (error) {
      console.error(`[productService.getProductById] Failed to fetch product ${id}:`, error.message);
      return null;
    }
  },

  async getCategories() {
    try {
      const response = await apiClient.get('/categories');
      const rawList = response.data?.data || response.data || [];
      if (Array.isArray(rawList)) {
        return rawList;
      }
      return [];
    } catch (error) {
      console.error('[productService.getCategories] Failed to fetch categories:', error.message);
      return [];
    }
  },
};

export const cartService = {
  async getCart(clerkId) {
    try {
      if (!clerkId) return { items: [], subtotal: 0, itemCount: 0 };
      const response = await apiClient.get('/cart', { params: { clerkId } });
      return response.data || { items: [], subtotal: 0, itemCount: 0 };
    } catch (error) {
      console.error('[cartService.getCart] Error:', error.message);
      return { items: [], subtotal: 0, itemCount: 0 };
    }
  },

  async addToCart({ clerk_user_id, product_id, quantity = 1 }) {
    try {
      const response = await apiClient.post('/cart', { clerk_user_id, product_id, quantity });
      return response.data;
    } catch (error) {
      console.error('[cartService.addToCart] Error:', error.message);
      throw error;
    }
  },

  async updateQuantity({ clerk_user_id, product_id, quantity }) {
    try {
      const response = await apiClient.put('/cart', { clerk_user_id, product_id, quantity });
      return response.data;
    } catch (error) {
      console.error('[cartService.updateQuantity] Error:', error.message);
      throw error;
    }
  },

  async removeFromCart({ clerk_user_id, product_id }) {
    try {
      const response = await apiClient.delete('/cart/item', {
        data: { clerk_user_id, product_id },
      });
      return response.data;
    } catch (error) {
      console.error('[cartService.removeFromCart] Error:', error.message);
      throw error;
    }
  },

  async clearCart(clerk_user_id) {
    try {
      const response = await apiClient.delete('/cart/clear', {
        data: { clerk_user_id },
      });
      return response.data;
    } catch (error) {
      console.error('[cartService.clearCart] Error:', error.message);
      throw error;
    }
  },
};

export const orderService = {
  async createOrder(orderPayload) {
    try {
      const response = await apiClient.post('/orders', orderPayload);
      return response.data?.order || response.data;
    } catch (error) {
      console.error('[orderService.createOrder] Failed to create order in database:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  async createRazorpayOrder(orderPayload) {
    try {
      const response = await apiClient.post('/orders/razorpay/create', orderPayload);
      return response.data;
    } catch (error) {
      console.error('[orderService.createRazorpayOrder] Failed to create Razorpay order:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  async verifyPayment(paymentDetails) {
    try {
      const response = await apiClient.post('/orders/razorpay/verify', paymentDetails);
      return response.data;
    } catch (error) {
      console.error('[orderService.verifyPayment] Verification failed:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  async getRazorpayKey() {
    try {
      const response = await apiClient.get('/payment/razorpay-key');
      return response.data?.key_id;
    } catch (error) {
      console.warn('[orderService.getRazorpayKey] Could not fetch Razorpay key from backend:', error.message);
      return import.meta.env.VITE_RAZORPAY_KEY_ID;
    }
  },

  async getUserOrders(userId, options = {}) {
    if (!userId && !options.email && !options.orderId) {
      return [];
    }
    try {
      const params = {};
      if (userId) params.clerkId = userId;
      if (options.email) params.email = options.email;
      if (options.orderId) params.orderId = options.orderId;

      const res = await apiClient.get('/orders', { params });
      return res.data?.orders || res.data?.data || [];
    } catch (e) {
      console.error('[orderService.getUserOrders] Error fetching from database:', e.message);
      return [];
    }
  },

  async getOrderById(orderId) {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      return res.data?.order || res.data;
    } catch (e) {
      console.error(`[orderService.getOrderById] Failed to fetch order ${orderId}:`, e.message);
      return null;
    }
  },
};

export const couponService = {
  async validateCoupon(code, subtotal) {
    try {
      const res = await apiClient.post('/coupons/validate', { code, subtotal });
      return res.data;
    } catch (error) {
      const cleanCode = code?.toUpperCase().trim();
      if (cleanCode === 'AURA10') return { valid: true, discountAmount: subtotal * 0.1, code: 'AURA10', message: '10% OFF Applied' };
      if ((cleanCode === 'WELCOME20' || cleanCode === 'LUXE20') && subtotal >= 999) return { valid: true, discountAmount: subtotal * 0.2, code: 'WELCOME20', message: '20% OFF Applied' };
      if ((cleanCode === 'LUXE500' || cleanCode === 'FIRST50') && subtotal >= 2500) return { valid: true, discountAmount: 500, code: 'LUXE500', message: '₹500 OFF Applied' };
      throw error?.response?.data || { message: 'Invalid coupon code' };
    }
  },
};

export const userService = {
  async syncUser(userData) {
    try {
      const res = await apiClient.post('/users/sync', userData);
      return res.data?.user || res.data;
    } catch (e) {
      console.error('[userService.syncUser] Error:', e.message);
      return null;
    }
  },

  async getUser(id) {
    try {
      const res = await apiClient.get(`/users/${id}`);
      return res.data?.user || res.data;
    } catch (e) {
      console.error(`[userService.getUser] Error fetching user ${id}:`, e.message);
      return null;
    }
  },
};
