/**
 * Sukoon Bites - Authentication & User Profile Management
 * Vanilla JavaScript & LocalStorage
 */

// Helper to fill demo user credentials
function fillDemoUser() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    if (emailInput && passwordInput) {
        emailInput.value = "student@example.com";
        passwordInput.value = "password123";
        showToast("Demo user credentials auto-filled!", "info");
    }
}

// User Login Handler
function handleUserLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        showToast("Please enter both email and password.", "warning");
        return;
    }

    const users = getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === email && u.password === password);

    if (matchedUser) {
        setCurrentUser(matchedUser);
        showToast(`Welcome back, ${matchedUser.name}!`, "success");
        setTimeout(() => {
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
            window.location.href = redirectUrl;
        }, 1000);
    } else {
        showToast("Invalid email or password. Please try again.", "error");
    }
}

// User Registration Handler
function handleUserRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const phone = document.getElementById('registerPhone').value.trim();
    const address = document.getElementById('registerAddress') ? document.getElementById('registerAddress').value.trim() : '';
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Validation
    if (!name || !email || !phone || !password) {
        showToast("Please fill in all required fields.", "warning");
        return;
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address.", "warning");
        return;
    }

    // Phone validation
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        showToast("Please enter a valid 10-digit mobile number.", "warning");
        return;
    }

    // Password validation
    if (password.length < 6) {
        showToast("Password must be at least 6 characters long.", "warning");
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match. Please verify.", "error");
        return;
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email)) {
        showToast("An account with this email already exists! Please log in.", "warning");
        return;
    }

    const newUser = {
        id: "usr-" + Date.now().toString().slice(-5),
        name: name,
        email: email,
        phone: phone,
        address: address || "Campus Hostel, Main Block",
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    setUsers(users);
    setCurrentUser(newUser);

    showToast("Registration successful! Welcome to Sukoon Bites.", "success");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
}

// Load User Profile Data
function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) {
        showToast("Please log in to view your profile.", "warning");
        setTimeout(() => {
            window.location.href = "login.html?redirect=profile.html";
        }, 800);
        return;
    }

    // Fill profile fields
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const phoneEl = document.getElementById('profilePhone');
    const addressEl = document.getElementById('profileAddress');
    const memberSinceEl = document.getElementById('profileMemberSince');
    const headerNameEl = document.getElementById('profileHeaderName');
    const headerEmailEl = document.getElementById('profileHeaderEmail');

    if (nameEl) nameEl.value = user.name;
    if (emailEl) emailEl.value = user.email;
    if (phoneEl) phoneEl.value = user.phone || '';
    if (addressEl) addressEl.value = user.address || '';
    if (headerNameEl) headerNameEl.textContent = user.name;
    if (headerEmailEl) headerEmailEl.textContent = user.email;

    if (memberSinceEl && user.createdAt) {
        const dateObj = new Date(user.createdAt);
        memberSinceEl.textContent = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    }

    // Load User Orders for Profile Summary
    const orders = getOrders().filter(o => o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase());
    const totalOrdersEl = document.getElementById('profileTotalOrders');
    const totalSpentEl = document.getElementById('profileTotalSpent');

    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    if (totalSpentEl) {
        const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        totalSpentEl.textContent = formatCurrency(totalSpent);
    }

    const ordersTableBody = document.getElementById('profileOrdersTableBody');
    if (ordersTableBody) {
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        <i class="bi bi-bag-x fs-2 d-block mb-2"></i>
                        No orders placed yet. <a href="menu.html" class="text-danger fw-bold">Explore Menu</a>
                    </td>
                </tr>
            `;
        } else {
            ordersTableBody.innerHTML = orders.map(order => `
                <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>${order.orderTime || 'Recent'}</td>
                    <td>${order.items.length} Items</td>
                    <td><strong>${formatCurrency(order.total)}</strong></td>
                    <td>
                        <span class="badge rounded-pill bg-light text-dark border">${order.status}</span>
                        <a href="orders.html?id=${order.id}" class="btn btn-sm btn-outline-danger ms-2 py-0">Track</a>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Update Profile Handler
function handleProfileUpdate(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const updatedName = document.getElementById('profileName').value.trim();
    const updatedPhone = document.getElementById('profilePhone').value.trim();
    const updatedAddress = document.getElementById('profileAddress').value.trim();

    if (!updatedName || !updatedPhone) {
        showToast("Name and phone cannot be empty.", "warning");
        return;
    }

    user.name = updatedName;
    user.phone = updatedPhone;
    user.address = updatedAddress;

    // Update in users array
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...user };
        setUsers(users);
    }

    setCurrentUser(user);
    showToast("Profile details updated successfully!", "success");
    updateNavbarAuth();
    loadUserProfile();
}

// Bind auth forms if on auth/profile pages
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleUserLogin);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleUserRegister);

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        loadUserProfile();
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
});
