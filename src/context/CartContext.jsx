import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const COUPONS = {
  'AURA10': { code: 'AURA10', discountPercent: 10, description: '10% Off Sitewide' },
  'WELCOME20': { code: 'WELCOME20', discountPercent: 20, description: '20% First Order Welcome Discount' },
  'LUXE50': { code: 'LUXE50', discountFlat: 50, minOrder: 300, description: '$50 Flat Off orders over $300' },
};

export function CartProvider({ children }) {
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
          title: product.title,
          price: product.price,
          discountPercentage: product.discountPercentage || 0,
          thumbnail: product.thumbnail || product.images?.[0],
          brand: product.brand || 'AURA',
          selectedColor,
          selectedSize,
          quantity,
          stock: product.stock || 20,
        },
      ];
    });

    showToast(`Added "${product.title}" to your cart.`);
  };

  const removeFromCart = (cartItemId) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast('Item removed from cart.', 'info');
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
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

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const tax = Number(((subtotal - discountAmount) * 0.05).toFixed(2));
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
