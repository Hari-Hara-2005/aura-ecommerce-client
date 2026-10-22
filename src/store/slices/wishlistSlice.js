import { createSlice } from '@reduxjs/toolkit';

function getInitialWishlist() {
  try {
    const saved = localStorage.getItem('aura_wishlist_items');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function syncWishlistStorage(items) {
  try {
    localStorage.setItem('aura_wishlist_items', JSON.stringify(items));
  } catch {}
}

const initialState = {
  items: getInitialWishlist(),
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.some((item) => item.id === product.id);
      if (exists) {
        state.items = state.items.filter((item) => item.id !== product.id);
      } else {
        state.items.push(product);
      }
      syncWishlistStorage(state.items);
    },

    setWishlist: (state, action) => {
      state.items = action.payload || [];
      syncWishlistStorage(state.items);
    },

    clearWishlist: (state) => {
      state.items = [];
      syncWishlistStorage([]);
    },
  },
});

export const { toggleWishlist, setWishlist, clearWishlist } = wishlistSlice.actions;

export const selectWishlist = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some((item) => item.id === productId);

export default wishlistSlice.reducer;
