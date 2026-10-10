import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthUser } from './AuthContext';
import { cartService, userService } from '../services/api';

const CartContext = createContext(null);

export const COUPONS = {
  'AURA10': { code: 'AURA10', discountPercent: 10, description: '10% Off Sitewide' },
  'WELCOME20': { code: 'WELCOME20', discountPercent: 20, description: '20% First Order Welcome Discount' },
  'LUXE500': { code: 'LUXE500', discountFlat: 500, minOrder: 2500, description: '₹500 Flat Off orders over ₹2,500' },
};

export function CartProvider({ children }) {
  const { user, isSignedIn } = useAuthUser();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync user with database and load DB cart when signed in
  useEffect(() => {
    if (isSignedIn && user?.id) {
      // 1. Sync user profile into PostgreSQL users table
      userService.syncUser({
        clerk_user_id: user.id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client',
        email: user.primaryEmailAddress?.emailAddress || null,
        phone: user.primaryPhoneNumber?.phoneNumber || null,
      }).catch(() => {});

      // 2. Fetch cart from database
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
          setItems(formatted);
        }
      }).catch(() => {});
    }
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    localStorage.setItem('aura_cart_items', JSON.stringify(items));
  }, [items]);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 2800 ? null : prev));
    }, 3000);
  };

  const closeToast = () => setToast(null);

  const addToCart = (product, quantity = 1, options = {}) => {
    const selectedColor = options.color || product.colors?.[0] || 'Default';
    const selectedSize = options.size || product.sizes?.[0] || 'Standard';
    const cartItemId = `${product.id}-${selectedColor}-${selectedSize}`;

    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prevItems.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prevItems,
        {
          cartItemId,
          id: product.id,
          title: product.title || product.name,
          price: product.price,
          discountPercentage: product.discountPercentage || 0,
          thumbnail: product.thumbnail || product.image || product.images?.[0],
          brand: product.brand || product.category || 'AURA',
          selectedColor,
          selectedSize,
          quantity,
          stock: product.stock || 20,
        },
      ];
    });

    // Sync to DB cart if user is signed in
    if (isSignedIn && user?.id && product.id) {
      cartService.addToCart({
        clerk_user_id: user.id,
        product_id: product.id,
        quantity,
      }).catch((e) => console.warn('Could not sync item to DB cart:', e.message));
    }

    showToast(`Added "${product.title || product.name}" to your cart.`);
  };

  const removeFromCart = (cartItemId) => {
    const itemToRemove = items.find((item) => item.cartItemId === cartItemId);
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));

    if (isSignedIn && user?.id && itemToRemove?.id) {
      cartService.removeFromCart({
        clerk_user_id: user.id,
        product_id: itemToRemove.id,
      }).catch(() => {});
    }

    showToast('Item removed from cart.', 'info');
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const targetItem = items.find((item) => item.cartItemId === cartItemId);
    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );

    if (isSignedIn && user?.id && targetItem?.id) {
      cartService.updateQuantity({
        clerk_user_id: user.id,
        product_id: targetItem.id,
        quantity: newQty,
      }).catch(() => {});
    }
  };

  const clearCart = () => {
    setItems([]);
    if (isSignedIn && user?.id) {
      cartService.clearCart(user.id).catch(() => {});
    }
  };

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (COUPONS[clean]) {
      setAppliedCoupon(COUPONS[clean]);
      showToast(`Coupon "${clean}" applied successfully!`, 'success');
      return { success: true, message: 'Coupon applied!' };
    }
    showToast(`Invalid coupon code "${code}". Try AURA10 or WELCOME20.`, 'error');
    return { success: false, message: 'Invalid coupon' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discountAmount = (subtotal * appliedCoupon.discountPercent) / 100;
    } else if (appliedCoupon.discountFlat) {
      if (subtotal >= (appliedCoupon.minOrder || 0)) {
        discountAmount = appliedCoupon.discountFlat;
      }
    }
  }

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const tax = Number(((subtotal - discountAmount) * 0.18).toFixed(2));
  const total = Math.max(0, Number((subtotal - discountAmount + shipping + tax).toFixed(2)));

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
