import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    theme: themeReducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Re-export standard typed/convenience hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export * from './slices/cartSlice';
export * from './slices/wishlistSlice';
export * from './slices/themeSlice';
export * from './slices/authSlice';
