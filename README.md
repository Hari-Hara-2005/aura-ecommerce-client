# AURA LUXE | Modern Client-Side E-Commerce Platform

A client-side e-commerce web application built with **React 19**, **Vite**, **Tailwind CSS v4**, **Axios**, **Clerk Authentication**, and **Razorpay Payment Gateway**.

---

## 🌟 Features Implemented

1. **Home Page (`/`)**:
   - Hero banner with animated gradients, badges, and trust counters.
   - Live Countdown Flash Sale promotion.
   - Interactive Department Showcase (Electronics, Horology & Watches, Atelier Couture, Perfumery).
   - Trending & Featured items grid with quick add to cart and instant preview.
   - Customer feedback and newsletter with promo code unlock.

2. **Catalog & Products Page (`/products`)**:
   - Dynamic search filtering by keyword.
   - Department / Category navigation chips.
   - Price range slider ($20 - $2,500).
   - Rating filter (4★, 4.5★, 4.8★).
   - Sort by: Price (Low to High / High to Low), Top Rated, Alphabetical.
   - Grid and List view switcher.
   - Empty state with instant reset filters.

3. **Product Detail Page (`/products/:id`)**:
   - Interactive high-res media gallery with thumbnail selector.
   - Stock indicators and discount tags.
   - Color and size configuration selector.
   - Stepper quantity modifier.
   - "Add to Shopping Bag" and instant "Buy Now" (direct to checkout).
   - Technical specifications, materials & handling tabs.
   - Verified customer reviews with interactive "Write a Review" form.
   - Recommended complementary products grid.

4. **Cart Management (`/cart` & Global Slide-Over Drawer)**:
   - Global flyout drawer accessible from any page.
   - Free shipping progress bar ($150 threshold).
   - Quantity increment/decrement and item removal.
   - Coupon system with valid codes:
     - `AURA10` — 10% Off Sitewide
     - `WELCOME20` — 20% First Order Welcome Discount
     - `LUXE50` — $50 Flat Off orders over $300
   - Automated calculation of subtotal, discounts, shipping, and taxes.

5. **Checkout & Razorpay Payment (`/checkout`)**:
   - Customer contact information and address inputs.
   - Razorpay payment gateway integration with 256-bit SSL encryption.
   - Built-in **Razorpay Test Simulator Modal** for testing full payment flows without requiring an active merchant account immediately.
   - Automatic order creation and payment verification via Axios.

6. **Order Confirmation & Invoice (`/order-success/:orderId`)**:
   - Celebration checkmark animation with order confirmation.
   - Official invoice receipt with print/download functionality.
   - Breakdown of purchased items, delivery address, and transaction references.

7. **Authentication with Clerk (`/sign-in`, `/sign-up`, `/profile`)**:
   - Integrated with `@clerk/clerk-react`.
   - Built-in **Dual-Mode System**:
     - **Live Clerk Mode**: Renders Clerk `<SignIn />`, `<SignUp />`, `<UserButton />` as soon as `VITE_CLERK_PUBLISHABLE_KEY` is provided in `.env`.
     - **Interactive Demo Mode**: Fallback demo accounts ("Alex (Buyer)", "Jordan (VIP)") so you can test all protected workflows right away!

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or edit `.env`:
```env
# Clerk Authentication (Get key from https://dashboard.clerk.com)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Razorpay Payment Gateway (Get Key ID from https://dashboard.razorpay.com/#/app/keys)
VITE_RAZORPAY_KEY_ID=rzp_test_...

# Backend API Base URL
VITE_API_BASE_URL=https://dummyjson.com
```

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:5173/` in your browser.

---

## 🔌 Replacing Dummy API with Your Original Backend

The app utilizes Axios through centralized services in [src/services/api.js](file:///c:/Users/Administrator/Desktop/Warehouse/E-commerce/Client/src/services/api.js):

1. Update `VITE_API_BASE_URL` in `.env` to point to your backend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
2. Modify endpoints in `src/services/api.js`:
   - `productService.getProducts()`: Calls `GET /products`
   - `productService.getProductById(id)`: Calls `GET /products/:id`
   - `orderService.createOrder(payload)`: Calls `POST /orders`
   - `orderService.verifyPayment(paymentDetails)`: Calls `POST /orders/verify-payment`

---

## 💳 Razorpay Live Keys

To accept real payments with Razorpay:
1. Create an account at [Razorpay](https://razorpay.com).
2. Generate API Keys in **Dashboard > Settings > API Keys**.
3. Set `VITE_RAZORPAY_KEY_ID=rzp_live_your_key` in `.env`.
