// BAGORA Main App Controller & Shared UI Utilities

// Currency Formatter for INR (₹)
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Toast Notification System
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Update Cart Badge Counter across all page headers
function updateHeaderCartBadge() {
  const badgeElements = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  badgeElements.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.style.transform = 'scale(1.2)';
      setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
  });
}

// Render Star Rating SVG HTML
function renderStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let starsHtml = '';
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += '★';
    } else if (i === fullStars && hasHalf) {
      starsHtml += '½';
    } else {
      starsHtml += '☆';
    }
  }
  return starsHtml;
}

// Quick View Modal Controller
function openQuickViewModal(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const modalOverlay = document.getElementById('quickview-modal');
  if (!modalOverlay) return;

  const modalContent = modalOverlay.querySelector('.quickview-grid');
  modalContent.innerHTML = `
    <div class="quickview-img">
      <img src="${product.image}" alt="${product.name}" />
    </div>
    <div class="quickview-details">
      <span class="product-category">${product.category}</span>
      <h2>${product.name}</h2>
      <div class="product-rating">
        <span>${renderStarRating(product.rating)}</span>
        <span class="count">${product.rating} (${product.reviews} reviews)</span>
      </div>
      <div class="quickview-price">${formatINR(product.price)} <span class="old-price" style="font-size:1rem; text-decoration:line-through; color:var(--text-muted);">${formatINR(product.oldPrice)}</span></div>
      <span class="stock-tag">✓ ${product.stock}</span>
      <p class="quickview-desc">${product.description}</p>
      
      <div class="quantity-picker">
        <label style="font-weight:600; font-size:0.9rem;">Quantity:</label>
        <button class="qty-btn" id="modal-qty-minus">-</button>
        <input type="text" class="qty-input" id="modal-qty-val" value="1" readonly />
        <button class="qty-btn" id="modal-qty-plus">+</button>
      </div>

      <div style="display:flex; gap:1rem;">
        <button class="btn btn-accent btn-lg" id="modal-add-btn" style="flex-grow:1;">
          Add to Cart 🛒
        </button>
        <a href="product.html?id=${product.id}" class="btn btn-outline btn-lg">Full Details</a>
      </div>
    </div>
  `;

  let currentQty = 1;
  const minusBtn = modalContent.querySelector('#modal-qty-minus');
  const plusBtn = modalContent.querySelector('#modal-qty-plus');
  const qtyInput = modalContent.querySelector('#modal-qty-val');
  const addBtn = modalContent.querySelector('#modal-add-btn');

  minusBtn.addEventListener('click', () => {
    if (currentQty > 1) {
      currentQty--;
      qtyInput.value = currentQty;
    }
  });

  plusBtn.addEventListener('click', () => {
    currentQty++;
    qtyInput.value = currentQty;
  });

  addBtn.addEventListener('click', () => {
    addToCart(product.id, currentQty);
    showToast(`Added ${currentQty} x "${product.name}" to cart!`);
    modalOverlay.classList.remove('active');
  });

  modalOverlay.classList.add('active');
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Drawer Toggle
  const mobileToggleBtn = document.querySelector('.mobile-toggle');
  const navLinksMenu = document.querySelector('.nav-links');

  if (mobileToggleBtn && navLinksMenu) {
    mobileToggleBtn.addEventListener('click', () => {
      navLinksMenu.classList.toggle('active');
    });
  }

  // Update header cart badge initially
  updateHeaderCartBadge();

  // Listen for custom cart update events
  window.addEventListener('cartUpdated', () => {
    updateHeaderCartBadge();
  });

  // Modal Close Listeners
  const modalOverlay = document.getElementById('quickview-modal');
  if (modalOverlay) {
    const closeBtn = modalOverlay.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
    }
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }
});
