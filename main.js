/**
 * Sukoon Bites - Main Core JavaScript
 * College Web Development Project
 * 
 * Handles:
 * - Default mock data initialization (Foods, Users, Orders, Settings)
 * - LocalStorage sync and helpers
 * - Shared UI components (Navbar badge, Auth status, Toast alerts)
 * - Currency and Date formatters
 */

// Global Storage Keys
const STORAGE_KEYS = {
    FOODS: 'sukoon_foods',
    USERS: 'sukoon_users',
    CURRENT_USER: 'sukoon_currentUser',
    CART: 'sukoon_cart',
    ORDERS: 'sukoon_orders',
    SETTINGS: 'sukoon_settings',
    ADMIN_SESSION: 'sukoon_adminSession'
};

// Default Initial Food Catalog (At least 16+ rich items across 8 categories)
const DEFAULT_FOODS = [
    {
        id: "sb-food-1",
        name: "Margherita Basil Pizza",
        category: "Pizza",
        price: 249,
        veg: true,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80",
        description: "Classic hand-tossed crust topped with rich San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves.",
        available: true
    },
    {
        id: "sb-food-2",
        name: "Spicy Paneer Tikka Pizza",
        category: "Pizza",
        price: 329,
        veg: true,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
        description: "Tandoori marinated cottage cheese cubes, crisp capsicum, red onions, and melted mozzarella on a zesty herb crust.",
        available: true
    },
    {
        id: "sb-food-3",
        name: "Chicken Pepperoni Feast Pizza",
        category: "Pizza",
        price: 399,
        veg: false,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
        description: "Generously loaded with tender spiced chicken pepperoni, smoked paprika, and extra stretchy mozzarella cheese.",
        available: true
    },
    {
        id: "sb-food-4",
        name: "Crispy Veg Aloo Tikki Burger",
        category: "Burger",
        price: 119,
        veg: true,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
        description: "Golden crisp potato patty seasoned with Indian herbs, fresh lettuce, juicy tomatoes, and creamy tangy mayo in a toasted sesame bun.",
        available: true
    },
    {
        id: "sb-food-5",
        name: "Grilled Chicken Supreme Burger",
        category: "Burger",
        price: 199,
        veg: false,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        description: "Juicy flame-grilled chicken breast patty topped with melted cheddar slice, caramelized onions, and smoky BBQ relish.",
        available: true
    },
    {
        id: "sb-food-6",
        name: "Hyderabadi Dum Chicken Biryani",
        category: "Biryani",
        price: 299,
        veg: false,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
        description: "Fragrant long-grain basmati rice layered with succulent marinated chicken, saffron milk, caramelized onions, and slow-cooked in handi.",
        available: true
    },
    {
        id: "sb-food-7",
        name: "Royal Paneer & Veg Dum Biryani",
        category: "Biryani",
        price: 249,
        veg: true,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=600&q=80",
        description: "Royal preparation of basmati rice infused with aromatic whole spices, saffron, cottage cheese cubes, and garden-fresh vegetables.",
        available: true
    },
    {
        id: "sb-food-8",
        name: "Masala Dosa with Sambar & Chutneys",
        category: "South Indian",
        price: 139,
        veg: true,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
        description: "Crispy golden fermented crepe stuffed with spiced potato masala, served with piping hot dal sambar and coconut-tomato chutneys.",
        available: true
    },
    {
        id: "sb-food-9",
        name: "Steamed Idli Vada Combo",
        category: "South Indian",
        price: 110,
        veg: true,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
        description: "Two fluffy steamed rice cakes paired with two crunchy medu vadas, served with fragrant drumstick sambar and fresh mint-coconut chutney.",
        available: true
    },
    {
        id: "sb-food-10",
        name: "Desi Veg Hakka Noodles",
        category: "Chinese",
        price: 169,
        veg: true,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
        description: "Wok-tossed noodles with crunchy bell peppers, cabbage, carrots, spring onions, and a delicate touch of garlic soy sauce.",
        available: true
    },
    {
        id: "sb-food-11",
        name: "Chilli Chicken Dry (Indo-Chinese)",
        category: "Chinese",
        price: 239,
        veg: false,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
        description: "Crispy batter-fried chicken bites tossed with fresh green chillies, diced capsicum, garlic, and fiery schezwan sauce.",
        available: true
    },
    {
        id: "sb-food-12",
        name: "Grilled Veg Bombay Club Sandwich",
        category: "Sandwiches",
        price: 149,
        veg: true,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
        description: "Triple-layered toasted bread packed with spiced mint chutney, cucumber slices, beetroots, potatoes, and gooey melted cheese.",
        available: true
    },
    {
        id: "sb-food-13",
        name: "Tandoori Chicken Tikka Sandwich",
        category: "Sandwiches",
        price: 189,
        veg: false,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80",
        description: "Shredded smoked tandoori chicken tossed in house chipotle spread, crisp lettuce, and pickled onions inside toasted herb bread.",
        available: true
    },
    {
        id: "sb-food-14",
        name: "Warm Gulab Jamun (2 Pcs)",
        category: "Desserts",
        price: 79,
        veg: true,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
        description: "Traditional soft khoya milk dumplings fried to golden perfection and soaked in warm cardamom and rose-infused sugar syrup.",
        available: true
    },
    {
        id: "sb-food-15",
        name: "Choco Lava Molten Cake",
        category: "Desserts",
        price: 119,
        veg: true,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
        description: "Decadent mini chocolate sponge cake filled with a gooey, warm melted chocolate core that oozes out with every bite.",
        available: true
    },
    {
        id: "sb-food-16",
        name: "Classic Cold Coffee with Ice Cream",
        category: "Beverages",
        price: 119,
        veg: true,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
        description: "Thick, creamy blend of rich espresso, chilled whole milk, topped with a scoop of vanilla bean ice cream and chocolate drizzle.",
        available: true
    },
    {
        id: "sb-food-17",
        name: "Fresh Mint Mojito Mocktail",
        category: "Beverages",
        price: 99,
        veg: true,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
        description: "Sparkling refresher muddled with fresh mint leaves, zesty lemon wedges, raw cane sugar syrup, and fizzy chilled soda.",
        available: true
    },
    {
        id: "sb-food-18",
        name: "Crispy Veg Spring Rolls (6 Pcs)",
        category: "Chinese",
        price: 159,
        veg: true,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
        description: "Crisp golden paper pastry rolls stuffed with shredded vegetables and glass noodles, served with sweet spicy chilli garlic dip.",
        available: true
    }
];

// Initial Demo Registered Users
const DEFAULT_USERS = [
    {
        id: "usr-101",
        name: "Rohan Sharma",
        email: "student@example.com",
        phone: "9876543210",
        password: "password123",
        address: "Room 304, Boys Hostel 2, Engineering College Campus, Hyderabad",
        createdAt: "2026-11-15T10:30:00Z"
    },
    {
        id: "usr-102",
        name: "Ananya Iyer",
        email: "ananya@example.com",
        phone: "9812345678",
        password: "password123",
        address: "Flat 402, Green Valley Apartments, Near Tech Park, Bengaluru",
        createdAt: "2026-11-18T14:20:00Z"
    }
];

// Initial Demo Orders
const DEFAULT_ORDERS = [
    {
        id: "SB-10492",
        customerName: "Rohan Sharma",
        customerEmail: "student@example.com",
        customerPhone: "9876543210",
        address: "Room 304, Boys Hostel 2, Engineering College Campus, Hyderabad",
        items: [
            { id: "sb-food-6", name: "Hyderabadi Dum Chicken Biryani", price: 299, qty: 1, veg: false },
            { id: "sb-food-16", name: "Classic Cold Coffee with Ice Cream", price: 119, qty: 1, veg: true }
        ],
        subtotal: 418,
        deliveryFee: 40,
        discount: 50,
        tax: 21,
        total: 429,
        paymentMethod: "Cash on Delivery",
        status: "Delivered",
        orderTime: "2026-11-20 19:45"
    },
    {
        id: "SB-10493",
        customerName: "Ananya Iyer",
        customerEmail: "ananya@example.com",
        customerPhone: "9812345678",
        address: "Flat 402, Green Valley Apartments, Near Tech Park, Bengaluru",
        items: [
            { id: "sb-food-1", name: "Margherita Basil Pizza", price: 249, qty: 1, veg: true },
            { id: "sb-food-15", name: "Choco Lava Molten Cake", price: 119, qty: 2, veg: true }
        ],
        subtotal: 487,
        deliveryFee: 0,
        discount: 100,
        tax: 24,
        total: 411,
        paymentMethod: "Online UPI (Demo)",
        status: "Out for Delivery",
        orderTime: "2026-11-22 21:15"
    }
];

// Initial Settings
const DEFAULT_SETTINGS = {
    restaurantName: "Sukoon Bites",
    tagline: "Good Food, Good Mood.",
    email: "support@sukoonbites.com",
    phone: "+91 98765 43210",
    address: "Campus Food Court, Innovation Block, Tech University Road, Bengaluru - 560100",
    deliveryFee: 40,
    freeDeliveryThreshold: 299,
    taxPercent: 5,
    coupons: [
        { code: "SUKOON50", discountPercent: 50, maxDiscount: 100, minOrder: 199, label: "50% OFF up to ₹100" },
        { code: "STUDENT20", discountPercent: 20, maxDiscount: 60, minOrder: 149, label: "20% Student Discount" },
        { code: "WELCOME", discountAmount: 40, minOrder: 99, label: "Flat ₹40 OFF on first order" }
    ]
};

/**
 * Initialize data in LocalStorage if not present
 */
function initSukoonData() {
    if (!localStorage.getItem(STORAGE_KEYS.FOODS)) {
        localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(DEFAULT_FOODS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
}

// Helpers for LocalStorage
function getFoods() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FOODS)) || DEFAULT_FOODS;
}
function setFoods(foods) {
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
}

function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || DEFAULT_USERS;
}
function setUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
}
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
}

function getCart() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
}
function setCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    updateCartCountBadge();
}

function getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || DEFAULT_ORDERS;
}
function setOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
}
function setSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

/**
 * Cart Item Count in Navbar
 */
function updateCartCountBadge() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + (item.qty || 1), 0);
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(badge => {
        badge.textContent = count;
        if (count > 0) {
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
    });
}

/**
 * Update Navbar Auth Links (Login / Register vs Profile / Logout)
 */
function updateNavbarAuth() {
    const user = getCurrentUser();
    const authContainer = document.getElementById('navbarAuthContainer');
    if (!authContainer) return;

    if (user) {
        authContainer.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-danger dropdown-toggle rounded-pill px-3 py-1 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle fs-5"></i>
                    <span>${user.name.split(' ')[0]}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                    <li class="px-3 py-2 border-bottom">
                        <small class="text-muted d-block">Signed in as</small>
                        <strong class="text-dark">${user.email}</strong>
                    </li>
                    <li><a class="dropdown-item py-2" href="profile.html"><i class="bi bi-person me-2"></i>My Profile</a></li>
                    <li><a class="dropdown-item py-2" href="orders.html"><i class="bi bi-bag-check me-2"></i>My Orders</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item py-2 text-danger" onclick="logoutUser()"><i class="bi bi-box-arrow-right me-2"></i>Log Out</button></li>
                </ul>
            </div>
        `;
    } else {
        authContainer.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <a href="login.html" class="btn btn-outline-danger btn-sm rounded-pill px-3">Log In</a>
                <a href="register.html" class="btn btn-danger btn-sm rounded-pill px-3 text-white">Sign Up</a>
            </div>
        `;
    }
}

/**
 * User Logout
 */
function logoutUser() {
    setCurrentUser(null);
    showToast("Logged out successfully", "info");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 800);
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = "success") {
    let toastContainer = document.getElementById('sukoonToastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'sukoonToastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    let bgClass = 'bg-danger text-white';
    let icon = 'bi-check-circle-fill';

    if (type === 'success') {
        bgClass = 'bg-success text-white';
        icon = 'bi-check-circle-fill';
    } else if (type === 'info') {
        bgClass = 'bg-primary text-white';
        icon = 'bi-info-circle-fill';
    } else if (type === 'warning') {
        bgClass = 'bg-warning text-dark';
        icon = 'bi-exclamation-triangle-fill';
    } else if (type === 'error' || type === 'danger') {
        bgClass = 'bg-danger text-white';
        icon = 'bi-x-circle-fill';
    }

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center gap-2">
                    <i class="bi ${icon} fs-5"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    if (window.bootstrap && bootstrap.Toast) {
        const bsToast = new bootstrap.Toast(toastElement, { delay: 3200 });
        bsToast.show();
        toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
    } else {
        setTimeout(() => toastElement.remove(), 3200);
    }
}

/**
 * Format Currency in Indian Rupees
 */
function formatCurrency(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

/**
 * Global Cart Functionality
 */
function addToCart(foodId, quantity = 1) {
    const foods = getFoods();
    const food = foods.find(f => f.id === foodId);
    if (!food) {
        showToast("Food item not found!", "error");
        return;
    }

    if (!food.available) {
        showToast("Sorry, this item is currently out of stock!", "warning");
        return;
    }

    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === foodId);

    if (existingIndex > -1) {
        cart[existingIndex].qty += quantity;
    } else {
        cart.push({
            id: food.id,
            name: food.name,
            price: food.price,
            veg: food.veg,
            image: food.image,
            category: food.category,
            qty: quantity
        });
    }

    setCart(cart);
    showToast(`Added "${food.name}" to cart!`, "success");
}

// Self-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initSukoonData();
    updateCartCountBadge();
    updateNavbarAuth();
});
