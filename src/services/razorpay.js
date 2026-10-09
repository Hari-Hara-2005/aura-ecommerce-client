
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async ({
  amount,
  currency = 'INR',
  orderName = 'AURA Premium Order',
  description = 'E-commerce Purchase',
  customer = { name: '', email: '', phone: '' },
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    console.error('Failed to load Razorpay SDK');
    onFailure?.(new Error('Razorpay SDK failed to load. Please check your internet connection.'));
    return;
  }

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

  const amountInSubunits = Math.round(Number(amount) * 100);

  const options = {
    key: razorpayKey,
    amount: amountInSubunits,
    currency: currency,
    name: 'AURA LUXE',
    description: description,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=128&q=80',
    handler: function (response) {
      console.log('[Razorpay Payment Success]:', response);
      onSuccess?.({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id || `order_${Date.now()}`,
        razorpay_signature: response.razorpay_signature || 'simulated_sig_' + Math.random().toString(36).substring(2),
      });
    },
    prefill: {
      name: customer.name || 'Valued Customer',
      email: customer.email || 'customer@example.com',
      contact: customer.phone || '9876543210',
    },
    notes: {
      address: 'AURA Corporate HQ',
      merchant_order_ref: orderName,
    },
    theme: {
      color: '#6366f1',
      backdrop_color: 'rgba(15, 23, 42, 0.85)',
    },
    modal: {
      ondismiss: function () {
        console.log('[Razorpay Modal Dismissed by user]');
        onDismiss?.();
      },
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.error('[Razorpay Payment Failed]:', response.error);
      onFailure?.(response.error);
    });
    rzp.open();
  } catch (err) {
    console.warn('[Razorpay initialization notice]:', err.message);
    onFailure?.(err);
  }
};
