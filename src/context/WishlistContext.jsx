import React, { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleWishlist as toggleWishlistAction,
  clearWishlist as clearWishlistAction,
  selectWishlist,
  selectWishlistCount,
} from '../store/slices/wishlistSlice';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const dispatch = useDispatch();
  const wishlist = useSelector(selectWishlist);
  const wishlistCount = useSelector(selectWishlistCount);

  const toggleWishlist = (product) => {
    dispatch(toggleWishlistAction(product));
  };

  const clearWishlist = () => {
    dispatch(clearWishlistAction());
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
