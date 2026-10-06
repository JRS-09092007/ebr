// BAGORA Checkout & Payment Gateway Engine

const ORDERS_HISTORY_KEY = 'bagora_orders_history';
const LAST_ORDER_KEY = 'bagora_last_order';

// Generate unique Order ID (e.g., BG-2026-8F42K1)
function generateOrderId() {
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BG-2026-${randomHex}`;
}

// Generate unique Transaction ID (e.g., TXN-938210)
function generateTransactionId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `TXN-${randomNum}`;
}

// Render Order Summary in Checkout sidebar
function renderCheckoutOrderSummary() {
  const container = document.getElementById('checkout-items-list');
  const totals = getCartTotals();
  const cart = getCart();

  if (!container) return;

  if (cart.length === 0) {
    window.location.href = 'shop.html';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; font-size:0.925rem;">
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <img src="${item.image}" alt="${item.name}" style="width:48px; height:48px; border-radius:6px; object-fit:cover;" />
        <div>
          <div style="font-weight:600;">${item.name}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">Qty: ${item.quantity} × ${formatINR(item.price)}</div>
        </div>
      </div>
      <div style="font-weight:700;">${formatINR(item.price * item.quantity)}</div>
    </div>
  `).join('');

  document.getElementById('checkout-subtotal').textContent = formatINR(totals.subtotal);
  document.getElementById('checkout-shipping').textContent = totals.shipping === 0 ? 'FREE' : formatINR(totals.shipping);
  
  const discountRow = document.getElementById('checkout-discount-row');
  if (totals.discount > 0 && discountRow) {
    discountRow.style.display = 'flex';
    document.getElementById('checkout-discount').textContent = `-${formatINR(totals.discount)}`;
  }

  document.getElementById('checkout-grand-total').textContent = formatINR(totals.grandTotal);
}

// Form Field Input Formatters
function formatCardNumber(input) {
  let v = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  let matches = v.match(/\d{4,16}/g);
  let match = (matches && matches[0]) || '';
  let parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  input.value = parts.length ? parts.join(' ') : v;
}

function formatExpiry(input) {
  let v = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    input.value = v.substring(0, 2) + '/' + v.substring(2, 4);
  } else {
    input.value = v;
  }
}

// Validate Customer Checkout Form
function validateCheckoutForm() {
  const name = document.getElementById('cust-name').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const city = document.getElementById('cust-city').value.trim();
  const state = document.getElementById('cust-state').value.trim();
  const pin = document.getElementById('cust-pin').value.trim();
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

  if (!name) { showToast('Please enter your Full Name', 'error'); return false; }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) { showToast('Please enter a valid Email Address', 'error'); return false; }
  
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phone || !phoneRegex.test(phone.replace(/[^0-9]/g, ''))) { 
    showToast('Please enter a valid 10-digit Mobile Number', 'error'); 
    return false; 
  }
  
  if (!address) { showToast('Please enter your Delivery Address', 'error'); return false; }
  if (!city) { showToast('Please enter your City', 'error'); return false; }
  if (!state) { showToast('Please select your State', 'error'); return false; }
  
  const pinRegex = /^\d{6}$/;
  if (!pin || !pinRegex.test(pin)) { showToast('Please enter a valid 6-digit PIN Code', 'error'); return false; }

  // If Card Payment selected, validate card details
  if (paymentMethod === 'card') {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardHolder = document.getElementById('card-holder').value.trim();
    const cardExpiry = document.getElementById('card-expiry').value.trim();
    const cardCvv = document.getElementById('card-cvv').value.trim();

    if (!cardNumber || cardNumber.length < 15) {
      showToast('Please enter a valid Card Number (16 digits)', 'error');
      return false;
    }
    if (!cardHolder) {
      showToast('Please enter Cardholder Name', 'error');
      return false;
    }
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      showToast('Please enter Card Expiry Date (MM/YY)', 'error');
      return false;
    }
    if (!cardCvv || cardCvv.length < 3) {
      showToast('Please enter a valid CVV (3 digits)', 'error');
      return false;
    }
  }

  return true;
}

// Start Payment Simulation Workflow
function triggerPaymentSimulation() {
  if (!validateCheckoutForm()) return;

  const paymentOverlay = document.getElementById('payment-loader-modal');
  const progressFill = document.getElementById('payment-progress-fill');
  const statusMsg = document.getElementById('payment-status-text');
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

  paymentOverlay.classList.add('active');

  const steps = paymentMethod === 'card' ? [
    { pct: '25%', text: 'Connecting to Payment Gateway...' },
    { pct: '60%', text: 'Verifying Card Credentials...' },
    { pct: '85%', text: 'Authorizing Transaction ₹' + getCartTotals().grandTotal + '...' },
    { pct: '100%', text: 'Payment Successful! Generating Invoice...' }
  ] : [
    { pct: '40%', text: 'Validating Cash on Delivery Order...' },
    { pct: '80%', text: 'Reserving Inventory Items...' },
    { pct: '100%', text: 'Order Confirmed! Preparing Delivery...' }
  ];

  let currentStep = 0;

  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      progressFill.style.width = steps[currentStep].pct;
      statusMsg.textContent = steps[currentStep].text;
      currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => completeCheckoutOrder(paymentMethod), 600);
    }
  }, 750);
}

// Complete Order & Redirect to Confirmation
function completeCheckoutOrder(paymentMethod) {
  const totals = getCartTotals();
  const cart = getCart();

  const customerInfo = {
    name: document.getElementById('cust-name').value.trim(),
    email: document.getElementById('cust-email').value.trim(),
    phone: document.getElementById('cust-phone').value.trim(),
    address: document.getElementById('cust-address').value.trim(),
    city: document.getElementById('cust-city').value.trim(),
    state: document.getElementById('cust-state').value.trim(),
    pin: document.getElementById('cust-pin').value.trim()
  };

  const orderData = {
    orderId: generateOrderId(),
    transactionId: paymentMethod === 'card' ? generateTransactionId() : 'N/A (Cash on Delivery)',
    orderDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery (COD)',
    paymentStatus: paymentMethod === 'card' ? 'Paid' : 'Pending (Pay on Delivery)',
    customer: customerInfo,
    items: cart,
    totals: totals,
    estimatedDelivery: '3–5 Business Days'
  };

  // Save to LocalStorage
  localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(orderData));
  
  // Append to Order History array
  const historyData = localStorage.getItem(ORDERS_HISTORY_KEY);
  const history = historyData ? JSON.parse(historyData) : [];
  history.push(orderData);
  localStorage.setItem(ORDERS_HISTORY_KEY, JSON.stringify(history));

  // Clear shopping cart
  clearCart();

  // Redirect to order confirmation page
  window.location.href = 'confirmation.html';
}

// Initialize Checkout Listeners
function initCheckoutPage() {
  renderCheckoutOrderSummary();

  const payCard = document.getElementById('option-card');
  const payCod = document.getElementById('option-cod');
  const cardDetailsForm = document.getElementById('card-details-fields');

  if (payCard && payCod && cardDetailsForm) {
    payCard.addEventListener('click', () => {
      document.getElementById('radio-card').checked = true;
      payCard.classList.add('selected');
      payCod.classList.remove('selected');
      cardDetailsForm.style.display = 'block';
    });

    payCod.addEventListener('click', () => {
      document.getElementById('radio-cod').checked = true;
      payCod.classList.add('selected');
      payCard.classList.remove('selected');
      cardDetailsForm.style.display = 'none';
    });
  }

  const cardNumInput = document.getElementById('card-number');
  const cardExpInput = document.getElementById('card-expiry');

  if (cardNumInput) {
    cardNumInput.addEventListener('input', () => formatCardNumber(cardNumInput));
  }
  if (cardExpInput) {
    cardExpInput.addEventListener('input', () => formatExpiry(cardExpInput));
  }

  const submitBtn = document.getElementById('place-order-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerPaymentSimulation();
    });
  }
}
