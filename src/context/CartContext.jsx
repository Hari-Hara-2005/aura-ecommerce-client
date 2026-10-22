import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthUser } from './AuthContext';
import { cartService, userService } from '../services/api';
import {
  COUPONS,
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity as updateQuantityAction,
  setCartItems as setCartItemsAction,
  clearCart as clearCartAction,
  setIsCartOpen as setIsCartOpenAction,
  applyCoupon as applyCouponAction,
  removeCoupon as removeCouponAction,
  showToast as showToastAction,
  closeToast as closeToastAction,
  selectCartItems,
  selectCartItemCount,
  selectSubtotal,
  selectDiscountAmount,
  selectShipping,
  selectTax,
  selectTotal,
  selectIsCartOpen,
  selectAppliedCoupon,
  selectToast,
} from '../store/slices/cartSlice';

export { COUPONS };

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const dispatch = useDispatch();
  const { user, isSignedIn } = useAuthUser();

  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartItemCount);
  const subtotal = useSelector(selectSubtotal);
  const discountAmount = useSelector(selectDiscountAmount);
  const shipping = useSelector(selectShipping);
  const tax = useSelector(selectTax);
  const total = useSelector(selectTotal);
  const isCartOpen = useSelector(selectIsCartOpen);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const toast = useSelector(selectToast);

  // Sync with backend when signed in
  useEffect(() => {
    if (isSignedIn && user?.id) {
      userService.syncUser({
        clerk_user_id: user.id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client',
        email: user.primaryEmailAddress?.emailAddress || null,
        phone: user.primaryPhoneNumber?.phoneNumber || null,
      }).catch(() => {});

      cartService.getCart(user.id).then((cartData) => {
        if (cartData && Array.isArray(cartData.items) && cartData.items.length > 0) {
          const formatted = cartData.items.map((it) => ({
            cartItemId: `${it.id || it.product_id}-Default-Standard`,
            id: it.id || it.product_id,
            title: it.title || it.name,
            price: Number(it.price),
            discountPercentage: 0,
            thumbnail: it.thumbnail || it.image,
            brand: it.category || 'AURA',
            selectedColor: 'Default',
            selectedSize: 'Standard',
            quantity: Number(it.quantity),
            stock: Number(it.stock || 20),
          }));
          dispatch(setCartItemsAction(formatted));
        }
      }).catch(() => {});
    }
  }, [isSignedIn, user?.id, dispatch]);

  const showToast = (message, type = 'success') => {
    dispatch(showToastAction({ message, type }));
    setTimeout(() => {
      dispatch(closeToastAction());
    }, 3000);
  };

  const closeToast = () => dispatch(closeToastAction());

  const addToCart = (product, quantity = 1, options = {}) => {
    dispatch(addToCartAction({ product, quantity, options }));
    if (isSignedIn && user?.id && product?.id) {
      cartService.addToCart({
        clerk_user_id: user.id,
        product_id: product.id,
        quantity,
      }).catch((e) => console.warn('Could not sync item to DB cart:', e.message));
    }
  };

  const removeFromCart = (cartItemId) => {
    const itemToRemove = items.find((item) => item.cartItemId === cartItemId);
    dispatch(removeFromCartAction(cartItemId));
    if (isSignedIn && user?.id && itemToRemove?.id) {
      cartService.removeFromCart({
        clerk_user_id: user.id,
        product_id: itemToRemove.id,
      }).catch(() => {});
    }
  };

  const updateQuantity = (cartItemId, newQty) => {
    const targetItem = items.find((item) => item.cartItemId === cartItemId);
    dispatch(updateQuantityAction({ cartItemId, quantity: newQty }));
    if (isSignedIn && user?.id && targetItem?.id) {
      cartService.updateQuantity({
        clerk_user_id: user.id,
        product_id: targetItem.id,
        quantity: newQty,
      }).catch(() => {});
    }
  };

  const clearCart = () => {
    dispatch(clearCartAction());
    if (isSignedIn && user?.id) {
      cartService.clearCart(user.id).catch(() => {});
    }
  };

  const applyCoupon = (code) => {
    dispatch(applyCouponAction(code));
    const clean = (code || '').trim().toUpperCase();
    return { success: Boolean(COUPONS[clean]), message: COUPONS[clean] ? 'Coupon applied!' : 'Invalid coupon' };
  };

  const removeCoupon = () => {
    dispatch(removeCouponAction());
  };

  const setIsCartOpen = (isOpen) => {
    dispatch(setIsCartOpenAction(isOpen));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount,
        shipping,
        tax,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        toast,
        showToast,
        closeToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
