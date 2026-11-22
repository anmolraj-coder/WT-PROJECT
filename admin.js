/**
 * Sukoon Bites - Admin Dashboard & Management System
 * College Web Development Project
 * 
 * Features:
 * - Admin Authentication Guard (admin@sukoonbites.com / admin123)
 * - Dashboard KPIs (Orders, Users, Foods, Revenue) & Mini CSS Bar Chart
 * - Food CRUD (Create, Read, Update, Delete, Toggle Availability)
 * - Order Status Management (Placed -> Preparing -> Out for Delivery -> Delivered)
 * - Registered Users Table & Actions
 * - Settings & Demo Reset
 */

const ADMIN_CREDENTIALS = {
    email: "admin@sukoonbites.com",
    password: "admin123"
};

// Check Admin Authentication Guard
function checkAdminAuth() {
    const isLoginPage = window.location.pathname.includes('admin-login.html');
    const isAdminLoggedIn = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';

    if (!isAdminLoggedIn && !isLoginPage) {
        window.location.href = "admin-login.html";
        return false;
    }
    if (isAdminLoggedIn && isLoginPage) {
        window.location.href = "dashboard.html";
        return false;
    }
    return true;
}

// Auto fill admin credentials for demo presentation
function fillDemoAdmin() {
    const emailInput = document.getElementById('adminEmail');
    const passInput = document.getElementById('adminPassword');
    if (emailInput && passInput) {
        emailInput.value = ADMIN_CREDENTIALS.email;
        passInput.value = ADMIN_CREDENTIALS.password;
        showToast("Admin demo credentials filled!", "info");
    }
}

// Admin Login Handler
function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminPassword').value.trim();

    if (email === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        showToast("Admin login successful. Opening dashboard...", "success");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    } else {
        showToast("Invalid admin credentials! (Default: admin@sukoonbites.com / admin123)", "error");
    }
}

// Admin Logout
function handleAdminLogout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    showToast("Admin logged out successfully.", "info");
    setTimeout(() => {
        window.location.href = "admin-login.html";
    }, 800);
}

// ==========================================
// 1. DASHBOARD OVERVIEW LOGIC
// ==========================================
function loadDashboardStats() {
    const orders = getOrders();
    const users = getUsers();
    const foods = getFoods();

    // 1. Total Orders
    const totalOrdersEl = document.getElementById('statTotalOrders');
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;

    // 2. Total Users
    const totalUsersEl = document.getElementById('statTotalUsers');
    if (totalUsersEl) totalUsersEl.textContent = users.length;

    // 3. Total Food Items
    const totalFoodsEl = document.getElementById('statTotalFoods');
    if (totalFoodsEl) totalFoodsEl.textContent = foods.length;

    // 4. Total Demo Revenue
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalRevenueEl = document.getElementById('statTotalRevenue');
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(totalRevenue);

    // Load Recent Orders Table on Dashboard
    const recentOrdersTable = document.getElementById('dashboardRecentOrdersBody');
    if (recentOrdersTable) {
        const recentOrders = orders.slice(0, 5);
        if (recentOrders.length === 0) {
            recentOrdersTable.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No orders placed yet.</td></tr>`;
        } else {
            recentOrdersTable.innerHTML = recentOrders.map(order => `
                <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>${order.customerName}<br><small class="text-muted">${order.customerPhone}</small></td>
                    <td>${order.items.length} items</td>
                    <td><strong>${formatCurrency(order.total)}</strong></td>
                    <td>
                        <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
                    </td>
                    <td>
                        <select class="form-select form-select-sm" onchange="quickUpdateOrderStatus('${order.id}', this.value)" style="width: 140px;">
                            <option value="Order Placed" ${order.status === 'Order Placed' ? 'selected' : ''}>Placed</option>
                            <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                            <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Get Badge Color Class for Status
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Order Placed': return 'badge-order-placed';
        case 'Preparing': return 'badge-order-preparing';
        case 'Out for Delivery': return 'badge-order-out-for-delivery';
        case 'Delivered': return 'badge-order-delivered';
        case 'Cancelled': return 'badge-order-cancelled';
        default: return 'bg-secondary text-white';
    }
}

// Quick status updater from select dropdown
function quickUpdateOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        setOrders(orders);
        showToast(`Order #${orderId} status changed to "${newStatus}"`, "success");
        if (typeof loadOrdersTable === 'function') loadOrdersTable();
    }
}

// ==========================================
// 2. FOOD MANAGEMENT LOGIC (manage-food.html)
// ==========================================
let editingFoodId = null;

function loadFoodTable(search = '', categoryFilter = 'All') {
    const foods = getFoods();
    const tableBody = document.getElementById('manageFoodTableBody');
    if (!tableBody) return;

    let filtered = foods.filter(food => {
        if (categoryFilter !== 'All' && food.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
        if (search) {
            const matchName = food.name.toLowerCase().includes(search.toLowerCase());
            const matchCat = food.category.toLowerCase().includes(search.toLowerCase());
            if (!matchName && !matchCat) return false;
        }
        return true;
    });

    const countEl = document.getElementById('foodItemsTotalCount');
    if (countEl) countEl.textContent = `${filtered.length} Dishes`;

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No dishes match your filter.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(item => `
        <tr>
            <td>
                <img src="${item.image}" alt="${item.name}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'">
            </td>
            <td>
                <div class="fw-bold text-dark">${item.name}</div>
                <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">${item.description}</small>
            </td>
            <td><span class="badge bg-light text-dark border">${item.category}</span></td>
            <td><strong>${formatCurrency(item.price)}</strong></td>
            <td>
                <span class="food-type-icon ${item.veg ? 'veg' : 'non-veg'}" title="${item.veg ? 'Vegetarian' : 'Non-Veg'}"></span>
                <span class="ms-1 small">${item.veg ? 'Veg' : 'Non-Veg'}</span>
            </td>
            <td>
                <button class="btn btn-sm ${item.available ? 'btn-outline-success' : 'btn-outline-secondary'} rounded-pill py-0 px-2" 
                        onclick="toggleFoodAvailability('${item.id}')">
                    ${item.available ? '<i class="bi bi-check2"></i> In Stock' : '<i class="bi bi-slash-circle"></i> Out of Stock'}
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary py-1 px-2 me-1" onclick="openEditFoodModal('${item.id}')" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="deleteFoodItem('${item.id}')" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Toggle Food Availability
function toggleFoodAvailability(id) {
    const foods = getFoods();
    const item = foods.find(f => f.id === id);
    if (item) {
        item.available = !item.available;
        setFoods(foods);
        showToast(`"${item.name}" is now ${item.available ? 'In Stock' : 'Out of Stock'}!`, "info");
        loadFoodTable();
    }
}

// Open Modal to Add Food
function openAddFoodModal() {
    editingFoodId = null;
    const form = document.getElementById('foodForm');
    if (form) form.reset();
    document.getElementById('foodModalTitle').textContent = "Add New Food Item";
    const modalEl = document.getElementById('foodModal');
    if (modalEl && window.bootstrap) {
        new bootstrap.Modal(modalEl).show();
    }
}

// Open Modal to Edit Food
function openEditFoodModal(id) {
    const foods = getFoods();
    const item = foods.find(f => f.id === id);
    if (!item) return;

    editingFoodId = id;
    document.getElementById('foodModalTitle').textContent = "Edit Food Item";
    document.getElementById('foodName').value = item.name;
    document.getElementById('foodCategory').value = item.category;
    document.getElementById('foodPrice').value = item.price;
    document.getElementById('foodImage').value = item.image;
    document.getElementById('foodDescription').value = item.description;
    document.getElementById('foodRating').value = item.rating || 4.5;
    document.getElementById('foodVeg').checked = item.veg === true;
    document.getElementById('foodNonVeg').checked = item.veg === false;
    document.getElementById('foodAvailable').checked = item.available !== false;

    const modalEl = document.getElementById('foodModal');
    if (modalEl && window.bootstrap) {
        new bootstrap.Modal(modalEl).show();
    }
}

// Save Food (Add or Update)
function handleSaveFood(e) {
    e.preventDefault();
    const name = document.getElementById('foodName').value.trim();
    const category = document.getElementById('foodCategory').value;
    const price = parseFloat(document.getElementById('foodPrice').value);
    const image = document.getElementById('foodImage').value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
    const description = document.getElementById('foodDescription').value.trim();
    const rating = parseFloat(document.getElementById('foodRating').value) || 4.5;
    const isVeg = document.getElementById('foodVeg').checked;
    const isAvailable = document.getElementById('foodAvailable').checked;

    if (!name || !price || !category) {
        showToast("Please provide food name, category, and price.", "warning");
        return;
    }

    let foods = getFoods();

    if (editingFoodId) {
        // Edit existing
        const index = foods.findIndex(f => f.id === editingFoodId);
        if (index > -1) {
            foods[index] = {
                ...foods[index],
                name,
                category,
                price,
                image,
                description,
                rating,
                veg: isVeg,
                available: isAvailable
            };
            showToast(`"${name}" updated successfully!`, "success");
        }
    } else {
        // Add new
        const newFood = {
            id: "sb-food-" + Date.now().toString().slice(-4),
            name,
            category,
            price,
            image,
            description,
            rating,
            veg: isVeg,
            available: isAvailable
        };
        foods.unshift(newFood);
        showToast(`New dish "${name}" added to menu!`, "success");
    }

    setFoods(foods);
    loadFoodTable();

    // Close modal
    const modalEl = document.getElementById('foodModal');
    if (modalEl && window.bootstrap) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
    }
}

// Delete Food Item
function deleteFoodItem(id) {
    let foods = getFoods();
    const item = foods.find(f => f.id === id);
    if (!item) return;

    if (confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) {
        foods = foods.filter(f => f.id !== id);
        setFoods(foods);
        showToast(`"${item.name}" deleted from menu.`, "info");
        loadFoodTable();
    }
}

// ==========================================
// 3. ORDER MANAGEMENT LOGIC (manage-orders.html)
// ==========================================
function loadOrdersTable(statusFilter = 'All', search = '') {
    const orders = getOrders();
    const tableBody = document.getElementById('manageOrdersTableBody');
    if (!tableBody) return;

    let filtered = orders.filter(order => {
        if (statusFilter !== 'All' && order.status !== statusFilter) return false;
        if (search) {
            const matchId = order.id.toLowerCase().includes(search.toLowerCase());
            const matchName = order.customerName.toLowerCase().includes(search.toLowerCase());
            const matchPhone = (order.customerPhone || '').includes(search);
            if (!matchId && !matchName && !matchPhone) return false;
        }
        return true;
    });

    const countEl = document.getElementById('ordersFilterCount');
    if (countEl) countEl.textContent = `${filtered.length} Orders`;

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No orders found matching the filter.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>
                <div class="fw-bold">${order.customerName}</div>
                <small class="text-muted">${order.customerPhone} | ${order.customerEmail}</small>
            </td>
            <td>
                <small class="text-muted d-inline-block text-truncate" style="max-width: 200px;">${order.address}</small>
            </td>
            <td>
                <strong>${formatCurrency(order.total)}</strong><br>
                <small class="badge bg-light text-dark border">${order.paymentMethod}</small>
            </td>
            <td><small class="text-muted">${order.orderTime || 'Recent'}</small></td>
            <td>
                <select class="form-select form-select-sm" onchange="quickUpdateOrderStatus('${order.id}', this.value)" style="width: 140px;">
                    <option value="Order Placed" ${order.status === 'Order Placed' ? 'selected' : ''}>Placed</option>
                    <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-info py-1 px-2" onclick="viewOrderModal('${order.id}')" title="View details">
                    <i class="bi bi-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

// View Full Order Details Modal
function viewOrderModal(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('modalOrderId').textContent = order.id;
    document.getElementById('modalOrderCustomer').textContent = order.customerName;
    document.getElementById('modalOrderContact').textContent = `${order.customerPhone} (${order.customerEmail})`;
    document.getElementById('modalOrderAddress').textContent = order.address;
    document.getElementById('modalOrderNotes').textContent = order.deliveryNotes || 'None';
    document.getElementById('modalOrderPayment').textContent = order.paymentMethod;
    document.getElementById('modalOrderStatus').textContent = order.status;

    const itemsContainer = document.getElementById('modalOrderItemsBody');
    itemsContainer.innerHTML = order.items.map(item => `
        <div class="d-flex justify-content-between py-2 border-bottom">
            <div>
                <span class="food-type-icon ${item.veg ? 'veg' : 'non-veg'} me-1"></span>
                <strong>${item.name}</strong> x ${item.qty}
            </div>
            <span>${formatCurrency(item.price * item.qty)}</span>
        </div>
    `).join('');

    document.getElementById('modalOrderSubtotal').textContent = formatCurrency(order.subtotal);
    document.getElementById('modalOrderDelivery').textContent = order.deliveryFee === 0 ? "FREE" : formatCurrency(order.deliveryFee);
    document.getElementById('modalOrderTax').textContent = formatCurrency(order.tax);
    document.getElementById('modalOrderDiscount').textContent = order.discount ? `- ${formatCurrency(order.discount)}` : '₹0';
    document.getElementById('modalOrderTotal').textContent = formatCurrency(order.total);

    const modalEl = document.getElementById('orderDetailsModal');
    if (modalEl && window.bootstrap) {
        new bootstrap.Modal(modalEl).show();
    }
}

// ==========================================
// 4. USER MANAGEMENT LOGIC (manage-users.html)
// ==========================================
function loadUsersTable() {
    const users = getUsers();
    const orders = getOrders();
    const tableBody = document.getElementById('manageUsersTableBody');
    if (!tableBody) return;

    const countEl = document.getElementById('usersTotalCount');
    if (countEl) countEl.textContent = `${users.length} Users`;

    if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No registered users found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = users.map(user => {
        const userOrders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase());
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

        return `
            <tr>
                <td><strong>${user.id}</strong></td>
                <td>
                    <div class="fw-bold text-dark">${user.name}</div>
                    <small class="text-muted">${user.address || 'Hostel / Campus'}</small>
                </td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>
                    <span class="badge bg-light text-dark border">${userOrders.length} orders</span><br>
                    <small class="text-success fw-bold">${formatCurrency(totalSpent)}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="deleteDemoUser('${user.id}')" title="Delete User">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Delete Demo User
function deleteDemoUser(id) {
    let users = getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (confirm(`Are you sure you want to delete demo user "${user.name}"?`)) {
        users = users.filter(u => u.id !== id);
        setUsers(users);
        showToast(`User "${user.name}" deleted.`, "info");
        loadUsersTable();
    }
}

// ==========================================
// 5. SETTINGS & RESET DEMO DATA
// ==========================================
function loadAdminSettings() {
    const settings = getSettings();
    const form = document.getElementById('settingsForm');
    if (!form) return;

    document.getElementById('settingRestaurantName').value = settings.restaurantName || "Sukoon Bites";
    document.getElementById('settingTagline').value = settings.tagline || "Good Food, Good Mood.";
    document.getElementById('settingEmail').value = settings.email || "support@sukoonbites.com";
    document.getElementById('settingPhone').value = settings.phone || "+91 98765 43210";
    document.getElementById('settingAddress').value = settings.address || "";
    document.getElementById('settingDeliveryFee').value = settings.deliveryFee || 40;
    document.getElementById('settingFreeDelivery').value = settings.freeDeliveryThreshold || 299;
    document.getElementById('settingTax').value = settings.taxPercent || 5;
}

function handleSaveSettings(e) {
    e.preventDefault();
    const settings = getSettings();

    settings.restaurantName = document.getElementById('settingRestaurantName').value.trim();
    settings.tagline = document.getElementById('settingTagline').value.trim();
    settings.email = document.getElementById('settingEmail').value.trim();
    settings.phone = document.getElementById('settingPhone').value.trim();
    settings.address = document.getElementById('settingAddress').value.trim();
    settings.deliveryFee = parseFloat(document.getElementById('settingDeliveryFee').value) || 40;
    settings.freeDeliveryThreshold = parseFloat(document.getElementById('settingFreeDelivery').value) || 299;
    settings.taxPercent = parseFloat(document.getElementById('settingTax').value) || 5;

    setSettings(settings);
    showToast("Restaurant settings updated successfully!", "success");
}

// Reset Entire LocalStorage Demo Data
function resetDemoData() {
    if (confirm("Reset all LocalStorage data to initial factory state? This will restore original foods, orders, and demo users.")) {
        localStorage.removeItem(STORAGE_KEYS.FOODS);
        localStorage.removeItem(STORAGE_KEYS.USERS);
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.CART);
        initSukoonData();
        showToast("Demo data reset successfully! Reloading...", "success");
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Auto init on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();

    // Admin login form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) loginForm.addEventListener('submit', handleAdminLogin);

    // Dashboard
    if (document.getElementById('statTotalOrders')) {
        loadDashboardStats();
    }

    // Manage Food
    if (document.getElementById('manageFoodTableBody')) {
        loadFoodTable();
        const foodForm = document.getElementById('foodForm');
        if (foodForm) foodForm.addEventListener('submit', handleSaveFood);

        // Search & category filters
        const foodSearch = document.getElementById('adminFoodSearch');
        const foodCatFilter = document.getElementById('adminFoodCategoryFilter');
        if (foodSearch) foodSearch.addEventListener('input', () => loadFoodTable(foodSearch.value, foodCatFilter ? foodCatFilter.value : 'All'));
        if (foodCatFilter) foodCatFilter.addEventListener('change', () => loadFoodTable(foodSearch ? foodSearch.value : '', foodCatFilter.value));
    }

    // Manage Orders
    if (document.getElementById('manageOrdersTableBody')) {
        loadOrdersTable();
        const orderStatusFilter = document.getElementById('adminOrderStatusFilter');
        const orderSearch = document.getElementById('adminOrderSearch');
        if (orderStatusFilter) orderStatusFilter.addEventListener('change', () => loadOrdersTable(orderStatusFilter.value, orderSearch ? orderSearch.value : ''));
        if (orderSearch) orderSearch.addEventListener('input', () => loadOrdersTable(orderStatusFilter ? orderStatusFilter.value : 'All', orderSearch.value));
    }

    // Manage Users
    if (document.getElementById('manageUsersTableBody')) {
        loadUsersTable();
    }

    // Settings
    if (document.getElementById('settingsForm')) {
        loadAdminSettings();
        document.getElementById('settingsForm').addEventListener('submit', handleSaveSettings);
    }
});
