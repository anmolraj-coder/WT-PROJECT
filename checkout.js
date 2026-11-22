/**
 * Sukoon Bites - Checkout & Order Placement Logic
 * Handles customer inputs, payment option selection, order creation & LocalStorage storage
 */

function initCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast("Your cart is empty. Please add items before checking out.", "warning");
        setTimeout(() => {
            window.location.href = "menu.html";
        }, 1000);
        return;
    }

    prefillUserData();
    renderCheckoutSummary();
    setupPaymentMethodSwitch();
}

// Prefill form if user is signed in
function prefillUserData() {
    const user = getCurrentUser();
    if (!user) return;

    const nameInput = document.getElementById('checkoutName');
    const emailInput = document.getElementById('checkoutEmail');
    const phoneInput = document.getElementById('checkoutPhone');
    const addressInput = document.getElementById('checkoutAddress');

    if (nameInput && !nameInput.value) nameInput.value = user.name || '';
    if (emailInput && !emailInput.value) emailInput.value = user.email || '';
    if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
    if (addressInput && !addressInput.value) addressInput.value = user.address || '';
}

// Render Order Summary in Checkout
function renderCheckoutSummary() {
    const cart = getCart();
    const settings = getSettings();
    const summaryItemsContainer = document.getElementById('checkoutItemsList');

    if (!summaryItemsContainer) return;

    summaryItemsContainer.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center gap-2">
                <span class="food-type-icon ${item.veg ? 'veg' : 'non-veg'}"></span>
                <span class="text-truncate" style="max-width: 170px;">${item.name}</span>
                <span class="badge bg-light text-dark border">x${item.qty}</span>
            </div>
            <span class="fw-semibold">${formatCurrency(item.price * item.qty)}</span>
        </div>
    `).join('');

    // Load persisted calculation or recalculate
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let deliveryFee = subtotal >= (settings.freeDeliveryThreshold || 299) ? 0 : (settings.deliveryFee || 40);
    const tax = Math.round(subtotal * ((settings.taxPercent || 5) / 100));

    let discount = 0;
    const storedBreakdown = sessionStorage.getItem('sukoon_order_breakdown');
    if (storedBreakdown) {
        try {
            const parsed = JSON.parse(storedBreakdown);
            discount = parsed.discount || 0;
        } catch (e) {}
    }

    const grandTotal = Math.max(0, subtotal + deliveryFee + tax - discount);

    document.getElementById('checkoutSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('checkoutDelivery').textContent = deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee);
    document.getElementById('checkoutTax').textContent = formatCurrency(tax);

    const discountRow = document.getElementById('checkoutDiscountRow');
    if (discountRow) {
        if (discount > 0) {
            discountRow.classList.remove('d-none');
            document.getElementById('checkoutDiscount').textContent = `- ${formatCurrency(discount)}`;
        } else {
            discountRow.classList.add('d-none');
        }
    }

    document.getElementById('checkoutGrandTotal').textContent = formatCurrency(grandTotal);
}

// Setup Payment Method Switch UI
function setupPaymentMethodSwitch() {
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const upiBox = document.getElementById('demoUpiBox');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (upiBox) {
                if (e.target.value === 'Online UPI (Demo)') {
                    upiBox.classList.remove('d-none');
                } else {
                    upiBox.classList.add('d-none');
                }
            }
        });
    });
}

// Handle Order Placement
function handlePlaceOrder(e) {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
        showToast("Cannot place order with an empty cart.", "error");
        return;
    }

    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const landmark = document.getElementById('checkoutLandmark') ? document.getElementById('checkoutLandmark').value.trim() : '';
    const notes = document.getElementById('checkoutNotes') ? document.getElementById('checkoutNotes').value.trim() : '';
    
    const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'Cash on Delivery';

    // Validate
    if (!name || !phone || !address) {
        showToast("Please provide your name, phone number, and delivery address.", "warning");
        return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        showToast("Please enter a valid 10-digit mobile number.", "warning");
        return;
    }

    // Calculations
    const settings = getSettings();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let deliveryFee = subtotal >= (settings.freeDeliveryThreshold || 299) ? 0 : (settings.deliveryFee || 40);
    const tax = Math.round(subtotal * ((settings.taxPercent || 5) / 100));

    let discount = 0;
    const storedBreakdown = sessionStorage.getItem('sukoon_order_breakdown');
    if (storedBreakdown) {
        try {
            const parsed = JSON.parse(storedBreakdown);
            discount = parsed.discount || 0;
        } catch (e) {}
    }
    const grandTotal = Math.max(0, subtotal + deliveryFee + tax - discount);

    // Generate unique human-readable Order ID
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `SB-${randomNum}`;

    // Format current date & time
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

    const fullAddress = landmark ? `${address} (Landmark: ${landmark})` : address;

    const newOrder = {
        id: orderId,
        customerName: name,
        customerEmail: email || (getCurrentUser() ? getCurrentUser().email : 'guest@example.com'),
        customerPhone: phone,
        address: fullAddress,
        deliveryNotes: notes,
        items: cart,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        discount: discount,
        tax: tax,
        total: grandTotal,
        paymentMethod: paymentMethod,
        status: "Order Placed", // Stepper status 1: Order Placed -> Preparing -> Out for Delivery -> Delivered
        orderTime: formattedDate
    };

    // Save in orders
    const orders = getOrders();
    orders.unshift(newOrder); // Prepend so it's top recent
    setOrders(orders);

    // Clear cart and stored discount
    setCart([]);
    sessionStorage.removeItem('sukoon_order_breakdown');

    // Show success animation or toast
    showToast(`Order #${orderId} placed successfully!`, "success");

    // Redirect to order tracking page
    setTimeout(() => {
        window.location.href = `orders.html?id=${orderId}`;
    }, 1200);
}

// Bind to DOM
document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        initCheckout();
        checkoutForm.addEventListener('submit', handlePlaceOrder);
    }
});
