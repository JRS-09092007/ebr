// BAGORA Shop Catalog & Filter Controller

let currentCategory = "All";
let currentSearchQuery = "";
let currentSortOption = "featured";

// Filter products based on search, category, and sorting
function getFilteredProducts() {
  return PRODUCTS.filter(product => {
    const matchesCategory = currentCategory === "All" || product.category.toLowerCase() === currentCategory.toLowerCase();
    const matchesSearch = currentSearchQuery === "" || 
      product.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(currentSearchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (currentSortOption === 'price-low') return a.price - b.price;
    if (currentSortOption === 'price-high') return b.price - a.price;
    if (currentSortOption === 'name-az') return a.name.localeCompare(b.name);
    if (currentSortOption === 'name-za') return b.name.localeCompare(a.name);
    if (currentSortOption === 'rating') return b.rating - a.rating;
    return 0; // Default featured order
  });
}

// Render product card HTML
function createProductCardHTML(product) {
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-thumb">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        ${product.badge ? `<span class="product-badge ${product.badge === 'Sale' ? 'sale' : ''}">${product.badge}</span>` : ''}
        <button class="quick-view-btn" onclick="openQuickViewModal('${product.id}')">⚡ Quick View</button>
      </div>
      <div class="product-body">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        <div class="product-rating">
          <span>${renderStarRating(product.rating)}</span>
          <span class="count">${product.rating} (${product.reviews})</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            ${formatINR(product.price)}
            ${product.oldPrice ? `<span class="old-price">${formatINR(product.oldPrice)}</span>` : ''}
          </div>
          <button class="add-cart-btn" title="Add to Cart" onclick="handleCardAddToCart('${product.id}')">
            🛒
          </button>
        </div>
      </div>
    </div>
  `;
}

// Add item to cart from card
function handleCardAddToCart(productId) {
  const product = getProductById(productId);
  if (product && addToCart(productId, 1)) {
    showToast(`Added "${product.name}" to cart!`);
  }
}

// Render grid to container
function renderShopGrid(containerId = 'products-grid') {
  const gridContainer = document.getElementById(containerId);
  if (!gridContainer) return;

  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <h3>No products found</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search query or category filter.</p>
        <button class="btn btn-outline" style="margin-top: 1.5rem;" onclick="resetShopFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = filtered.map(product => createProductCardHTML(product)).join('');
}

// Reset filters helper
function resetShopFilters() {
  currentCategory = "All";
  currentSearchQuery = "";
  currentSortOption = "featured";

  const searchInput = document.getElementById('shop-search-input');
  if (searchInput) searchInput.value = "";

  const sortSelect = document.getElementById('shop-sort-select');
  if (sortSelect) sortSelect.value = "featured";

  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'All');
  });

  renderShopGrid();
}

// Initialize Shop Page Elements & Listeners
function initShopPage() {
  const searchInput = document.getElementById('shop-search-input');
  const sortSelect = document.getElementById('shop-sort-select');
  const pillsContainer = document.getElementById('category-pills-container');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      renderShopGrid();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSortOption = e.target.value;
      renderShopGrid();
    });
  }

  if (pillsContainer) {
    pillsContainer.innerHTML = CATEGORIES.map(cat => `
      <button class="pill-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">
        ${cat}
      </button>
    `).join('');

    pillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;

      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.dataset.category;
      renderShopGrid();
    });
  }

  // Check URL search param for initial category filter (e.g. shop.html?category=Handbags)
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam && CATEGORIES.includes(catParam)) {
    currentCategory = catParam;
    if (pillsContainer) {
      document.querySelectorAll('.pill-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.category === catParam);
      });
    }
  }

  renderShopGrid();
}
