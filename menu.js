/**
 * Sukoon Bites - Food Menu & Filtering Logic
 * Dynamic rendering, search, category & food type filters, sorting
 */

let activeCategory = 'All';
let activeTypeFilter = 'all'; // 'all', 'veg', 'non-veg'
let activeSortOrder = 'default';
let searchQuery = '';

// Initialize Menu Page
function initMenu() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    if (categoryParam) {
        activeCategory = categoryParam;
    }
    if (searchParam) {
        searchQuery = searchParam;
        const searchInput = document.getElementById('menuSearchInput');
        if (searchInput) searchInput.value = searchQuery;
    }

    setupMenuListeners();
    renderCategoryPills();
    filterAndRenderMenu();
}

// Setup Event Listeners for Filters
function setupMenuListeners() {
    // Search input
    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            filterAndRenderMenu();
        });
    }

    // Sort select
    const sortSelect = document.getElementById('menuSortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            activeSortOrder = e.target.value;
            filterAndRenderMenu();
        });
    }

    // Veg / Non-Veg Radios or Buttons
    const typeButtons = document.querySelectorAll('[data-food-type]');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            typeButtons.forEach(b => b.classList.remove('active', 'btn-danger'));
            btn.classList.add('active');
            activeTypeFilter = btn.getAttribute('data-food-type');
            filterAndRenderMenu();
        });
    });
}

// Render Category Filter Pills
function renderCategoryPills() {
    const pillsContainer = document.getElementById('categoryPillsContainer');
    if (!pillsContainer) return;

    const categories = ['All', 'Pizza', 'Burger', 'Biryani', 'South Indian', 'Chinese', 'Sandwiches', 'Desserts', 'Beverages'];

    pillsContainer.innerHTML = categories.map(cat => `
        <button class="filter-pill ${cat.toLowerCase() === activeCategory.toLowerCase() ? 'active' : ''}" 
                onclick="selectCategory('${cat}')">
            ${cat}
        </button>
    `).join('');
}

// Category Selection Handler
function selectCategory(category) {
    activeCategory = category;
    renderCategoryPills();
    filterAndRenderMenu();
}

// Filter and Display Food Items
function filterAndRenderMenu() {
    const foods = getFoods();
    const menuContainer = document.getElementById('foodCardsContainer');
    const itemsCountEl = document.getElementById('menuItemsCount');

    if (!menuContainer) return;

    // Filter by Category
    let filtered = foods.filter(item => {
        if (activeCategory !== 'All' && item.category.toLowerCase() !== activeCategory.toLowerCase()) {
            return false;
        }

        // Filter by Veg / Non-Veg
        if (activeTypeFilter === 'veg' && !item.veg) return false;
        if (activeTypeFilter === 'non-veg' && item.veg) return false;

        // Filter by Search Query
        if (searchQuery) {
            const matchName = item.name.toLowerCase().includes(searchQuery);
            const matchDesc = item.description.toLowerCase().includes(searchQuery);
            const matchCategory = item.category.toLowerCase().includes(searchQuery);
            if (!matchName && !matchDesc && !matchCategory) return false;
        }

        return true;
    });

    // Sorting
    if (activeSortOrder === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (activeSortOrder === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (activeSortOrder === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    if (itemsCountEl) {
        itemsCountEl.textContent = `Showing ${filtered.length} dishes`;
    }

    // Render Cards
    if (filtered.length === 0) {
        menuContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="p-4 bg-white rounded-3 shadow-sm border">
                    <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                    <h5 class="mt-3 text-dark fw-bold">No Delicious Matches Found</h5>
                    <p class="text-muted mb-3">Try adjusting your search terms or clearing the selected filters.</p>
                    <button class="btn btn-outline-danger rounded-pill px-4" onclick="resetFilters()">Reset All Filters</button>
                </div>
            </div>
        `;
        return;
    }

    const cart = getCart();

    menuContainer.innerHTML = filtered.map(food => {
        const cartItem = cart.find(c => c.id === food.id);
        const inCartQty = cartItem ? cartItem.qty : 0;
        const isOutOfStock = food.available === false;

        return `
            <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4">
                <div class="food-card">
                    <div class="food-card-img-wrap">
                        <img src="${food.image}" alt="${food.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'">
                        <span class="food-category-tag">${food.category}</span>
                        ${isOutOfStock ? `<div class="out-of-stock-overlay"><i class="bi bi-slash-circle me-1"></i> Out of Stock</div>` : ''}
                    </div>
                    <div class="food-card-body">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <span class="food-type-icon ${food.veg ? 'veg' : 'non-veg'}" title="${food.veg ? 'Vegetarian' : 'Non-Vegetarian'}"></span>
                            <span class="rating-badge"><i class="bi bi-star-fill text-warning"></i> ${food.rating || '4.5'}</span>
                        </div>
                        <h6 class="food-title" title="${food.name}">${food.name}</h6>
                        <p class="food-desc">${food.description}</p>
                        <div class="food-card-footer">
                            <span class="food-price">${formatCurrency(food.price)}</span>
                            <div>
                                ${isOutOfStock 
                                    ? `<button class="btn btn-sm btn-secondary rounded-pill px-3" disabled>Unavailable</button>` 
                                    : `<button class="btn btn-sm btn-danger rounded-pill px-3 d-flex align-items-center gap-1" onclick="handleAddToCart('${food.id}')">
                                        <i class="bi bi-cart-plus"></i> Add
                                        ${inCartQty > 0 ? `<span class="badge bg-white text-danger ms-1">${inCartQty}</span>` : ''}
                                       </button>`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Add to Cart Wrapper with UI refresh
function handleAddToCart(foodId) {
    addToCart(foodId, 1);
    filterAndRenderMenu(); // Re-render to show updated item count badge
}

// Reset Filters
function resetFilters() {
    activeCategory = 'All';
    activeTypeFilter = 'all';
    activeSortOrder = 'default';
    searchQuery = '';

    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('menuSortSelect');
    if (sortSelect) sortSelect.value = 'default';

    const typeButtons = document.querySelectorAll('[data-food-type]');
    typeButtons.forEach(btn => {
        if (btn.getAttribute('data-food-type') === 'all') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderCategoryPills();
    filterAndRenderMenu();
}

// Bind to DOM
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('foodCardsContainer')) {
        initMenu();
    }
});
