import { createSlice } from '@reduxjs/toolkit';

export const COUPONS = {
  'AURA10': { code: 'AURA10', discountPercent: 10, description: '10% Off Sitewide' },
  'WELCOME20': { code: 'WELCOME20', discountPercent: 20, description: '20% First Order Welcome Discount' },
  'LUXE500': { code: 'LUXE500', discountFlat: 500, minOrder: 2500, description: '₹500 Flat Off orders over ₹2,500' },
};

function getInitialCartItems() {
  try {
    const saved = localStorage.getItem('aura_cart_items');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function syncCartStorage(items) {
  try {
    localStorage.setItem('aura_cart_items', JSON.stringify(items));
  } catch {}
}

const initialState = {
  items: getInitialCartItems(),
  isCartOpen: false,
  appliedCoupon: null,
  toast: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, options = {} } = action.payload;
      if (product.stock !== undefined && Number(product.stock) <= 0) {
        state.toast = {
          id: Date.now(),
          message: `"${product.title || product.name}" is currently out of stock.`,
          type: 'error',
        };
        return;
      }

      const selectedColor = options.color || product.colors?.[0] || 'Default';
      const selectedSize = options.size || product.sizes?.[0] || 'Standard';
      const cartItemId = `${product.id}-${selectedColor}-${selectedSize}`;

      const existingIndex = state.items.findIndex((it) => it.cartItemId === cartItemId);
      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          cartItemId,
          id: product.id,
          title: product.title || product.name,
          price: Number(product.price),
          discountPercentage: product.discountPercentage || 0,
          thumbnail: product.thumbnail || product.image || product.images?.[0],
          brand: product.brand || product.category || 'AURA',
          selectedColor,
          selectedSize,
          quantity,
          stock: product.stock || 20,
        });
      }

      syncCartStorage(state.items);
      state.toast = {
        id: Date.now(),
        message: `Added "${product.title || product.name}" to your cart.`,
        type: 'success',
      };
    },

    removeFromCart: (state, action) => {
      const cartItemId = action.payload;
      state.items = state.items.filter((it) => it.cartItemId !== cartItemId);
      syncCartStorage(state.items);
      state.toast = {
        id: Date.now(),
        message: 'Item removed from cart.',
        type: 'info',
      };
    },

    updateQuantity: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((it) => it.cartItemId !== cartItemId);
      } else {
        const item = state.items.find((it) => it.cartItemId === cartItemId);
        if (item) {
          item.quantity = quantity;
        }
      }
      syncCartStorage(state.items);
    },

    setCartItems: (state, action) => {
      state.items = action.payload || [];
      syncCartStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      syncCartStorage([]);
    },

    setIsCartOpen: (state, action) => {
      state.isCartOpen = action.payload;
    },

    applyCoupon: (state, action) => {
      const code = (action.payload || '').trim().toUpperCase();
      if (COUPONS[code]) {
        state.appliedCoupon = COUPONS[code];
        state.toast = {
          id: Date.now(),
          message: `Coupon "${code}" applied successfully!`,
          type: 'success',
        };
      } else {
        state.toast = {
          id: Date.now(),
          message: `Invalid coupon code "${code}". Try AURA10 or WELCOME20.`,
          type: 'error',
        };
      }
    },

    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.toast = {
        id: Date.now(),
        message: 'Coupon removed.',
        type: 'info',
      };
    },

    showToast: (state, action) => {
      const { message, type = 'success' } = action.payload;
      state.toast = { id: Date.now(), message, type };
    },

    closeToast: (state) => {
      state.toast = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setCartItems,
  clearCart,
  setIsCartOpen,
  applyCoupon,
  removeCoupon,
  showToast,
  closeToast,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectIsCartOpen = (state) => state.cart.isCartOpen;
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;
export const selectToast = (state) => state.cart.toast;

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((acc, item) => acc + item.quantity, 0);

export const selectSubtotal = (state) =>
  state.cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

export const selectDiscountAmount = (state) => {
  const subtotal = selectSubtotal(state);
  const coupon = state.cart.appliedCoupon;
  if (!coupon) return 0;
  if (coupon.discountPercent) {
    return (subtotal * coupon.discountPercent) / 100;
  }
  if (coupon.discountFlat && subtotal >= (coupon.minOrder || 0)) {
    return coupon.discountFlat;
  }
  return 0;
};

export const selectShipping = (state) => {
  const subtotal = selectSubtotal(state);
  return subtotal >= 999 || subtotal === 0 ? 0 : 99;
};

export const selectTax = (state) => {
  const subtotal = selectSubtotal(state);
  const discount = selectDiscountAmount(state);
  return Number(((subtotal - discount) * 0.18).toFixed(2));
};

export const selectTotal = (state) => {
  const subtotal = selectSubtotal(state);
  const discount = selectDiscountAmount(state);
  const shipping = selectShipping(state);
  const tax = selectTax(state);
  return Math.max(0, Number((subtotal - discount + shipping + tax).toFixed(2)));
};

export default cartSlice.reducer;
