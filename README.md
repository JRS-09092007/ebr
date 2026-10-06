# BAGORA — "Carry Your Style."
### Premium Bag & Accessories E-Commerce Store

---

## 📌 Overview
**BAGORA** is a fully functional, modern e-commerce web application selling handcrafted handbags, tech backpacks, executive laptop bags, travel duffels, wallets, and daily accessories.

---

## ✨ Features

### 🛍️ 1. Storefront & Catalog
- **14 Realistic Products**: Categorized under *Handbags, Backpacks, Laptop Bags, Travel Bags, Sling Bags, Wallets,* and *Accessories*.
- **Realistic INR Pricing**: Prices ranging from ₹499 to ₹2,799.
- **Dynamic Search**: Instant keyword search matching product title, description, or category.
- **Category Filter Pills**: Filter items instantly by category with active state indicators.
- **Sorting Options**: Sort catalog by Price (Low to High / High to Low), Name (A-Z / Z-A), and Highest Rated.
- **Quick View Modal & Product Details**: Inspect product specs, stock status, ratings, and quantity selectors.

### 🛒 2. Persistent Shopping Cart (`LocalStorage`)
- **Live Counter Badge**: Header cart icon dynamically displays item quantity across all pages.
- **Quantity Controls**: Increment/decrement quantity or remove items directly in cart view.
- **Financial Calculations**: Real-time updates for Subtotal, Flat Shipping (₹99 or FREE on orders over ₹1,999), and Promo Discount (`BAGORA10` for 10% off).
- **Refresh Persistence**: Cart contents persist seamlessly using browser `LocalStorage`.

### 💳 3. Payment Gateway & Checkout Flow
- **Customer Information Validation**: Field validation for Full Name, Email, 10-digit Indian Mobile Number, Address, City, State, and 6-digit PIN Code.
- **Payment Methods**:
  - **Credit / Debit Card**: Cardholder Name, 16-digit Card Number, Expiry Date (MM/YY), and CVV (3 digits).
  - **Cash on Delivery (COD)**.
- **Multi-step Payment Loader**: Animated progress bar simulating connection, authorization, and confirmation phases.

### 📄 4. Order Confirmation & Printable Receipt
- **Dynamic Order ID**: Generates unique IDs like `BG-2026-8F42K1` and transaction reference IDs (`TXN-XXXXXX`).
- **Complete Receipt**: Itemized summary table, shipping address, payment status, and estimated delivery window (3–5 business days).
- **Print Receipt Button**: Built-in `window.print()` styling for instant invoice printing.

### 📞 5. About & Contact Pages
- **About BAGORA**: Business mission, craftsmanship standards, and brand story.
- **Contact Form**: Interactive form validation with instant toast response.

---

## 🛠️ Technology Stack
- **Structure**: HTML5 (Semantic elements)
- **Styling**: Vanilla CSS3 (CSS Custom Properties, Flexbox, Grid, Glassmorphism, Google Fonts *Outfit* & *Inter*)
- **Logic**: Vanilla JavaScript (ES6+, Event Listeners, Custom Events)
- **Storage**: Browser `LocalStorage` (`bagora_cart`, `bagora_last_order`, `bagora_orders_history`)

---

## 📁 Project Structure

```
bagora/
├── index.html            # Home page (Hero, Categories, Featured Products, Value Props)
├── shop.html             # Product catalog (Search, Filters, Sort, Grid, Quick View)
├── product.html          # Individual product details view with specs & quantity selector
├── cart.html             # Shopping cart page (Quantity update, Remove, Subtotal, Promo code)
├── checkout.html         # Checkout page (Address validation, Card & COD simulation)
├── confirmation.html     # Order confirmation (Dynamic Order ID, Printable Receipt)
├── about.html            # Brand story & mission
├── contact.html          # Contact form with toast feedback & company details
├── css/
│   └── style.css         # Complete design system & responsive styling
├── js/
│   ├── products.js       # Master array of 14 products with specs & pricing
│   ├── cart.js           # Cart engine (LocalStorage CRUD, total calculations, cart badge)
│   ├── shop.js           # Catalog search, category filter, sorting, dynamic rendering
│   ├── checkout.js       # Form validation, step-by-step payment processing animation & order creation
│   └── main.js           # Header navbar sticky, mobile drawer, toast notification engine
└── README.md             # Store documentation
```

---

## 🚀 How to Run Locally

Run using any local web server:

### Option 1: Python HTTP Server
```bash
python3 -m http.server 8000 --directory bagora
```
Navigate to: `http://localhost:8000`

### Option 2: Node `serve`
```bash
npx -y serve bagora
```
