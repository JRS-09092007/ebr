// BAGORA LocalStorage Cart Engine

const CART_STORAGE_KEY = 'bagora_cart';
const COUPON_STORAGE_KEY = 'bagora_applied_coupon';

// Retrieve cart from LocalStorage
function getCart() {
  const data = localStorage.getItem(CART_STORAGE_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse cart data', e);
    return [];
  }
}

// Save cart to LocalStorage & notify listeners
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
}

// Add product to cart
function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product) return false;

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === productId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: quantity
    });
  }

  saveCart(cart);
  return true;
}

// Remove item from cart
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
}

// Update item quantity
function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const target = cart.find(item => item.id === productId);

  if (target) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      target.quantity = quantity;
      saveCart(cart);
    }
  }
}

// Clear cart
function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(COUPON_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));
}

// Get total count of items in cart
function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Get applied coupon code
function getAppliedCoupon() {
  return localStorage.getItem(COUPON_STORAGE_KEY) || null;
}

// Apply coupon code
function applyCoupon(code) {
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode === 'BAGORA10') {
    localStorage.setItem(COUPON_STORAGE_KEY, 'BAGORA10');
    return { success: true, discountPercent: 10, message: 'Coupon BAGORA10 applied! (10% Off)' };
  } else {
    return { success: false, message: 'Invalid coupon code. Try BAGORA10' };
  }
}

// Calculate full cart financials
function getCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Shipping calculation: Free above ₹1999, else ₹99 flat
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 99;

  // Coupon discount calculation
  const coupon = getAppliedCoupon();
  let discount = 0;
  if (coupon === 'BAGORA10') {
    discount = Math.round(subtotal * 0.10);
  }

  const grandTotal = Math.max(0, subtotal + shipping - discount);

  return {
    subtotal,
    shipping,
    discount,
    coupon,
    grandTotal,
    itemCount: getCartCount()
  };
}
