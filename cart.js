/**
 * Sukoon Bites - Shopping Cart Implementation
 * Real-time calculations, Quantity adjustments, Promo codes, LocalStorage sync
 */

let appliedCoupon = null;

// Render Cart Table & Calculation Summary
function renderCart() {
    const cartContainer = document.getElementById('cartItemsList');
    const emptyCartView = document.getElementById('emptyCartView');
    const cartContentView = document.getElementById('cartContentView');

    if (!cartContainer) return;

    const cart = getCart();
    const settings = getSettings();

    if (cart.length === 0) {
        if (emptyCartView) emptyCartView.classList.remove('d-none');
        if (cartContentView) cartContentView.classList.add('d-none');
        return;
    }

    if (emptyCartView) emptyCartView.classList.add('d-none');
    if (cartContentView) cartContentView.classList.remove('d-none');

    // Render Items
    cartContainer.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.qty;
        return `
            <div class="cart-item-card d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}" 
                         alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="food-type-icon ${item.veg ? 'veg' : 'non-veg'}"></span>
                            <h6 class="mb-0 fw-bold">${item.name}</h6>
                        </div>
                        <small class="text-muted">${formatCurrency(item.price)} each</small>
                    </div>
                </div>

                <div class="d-flex align-items-center gap-4 ms-auto">
                    <!-- Quantity Stepper -->
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateItemQuantity(${index}, -1)" title="Decrease">-</button>
                        <span class="qty-number">${item.qty}</span>
                        <button class="qty-btn" onclick="updateItemQuantity(${index}, 1)" title="Increase">+</button>
                    </div>

                    <!-- Total Price -->
                    <div class="text-end" style="min-width: 80px;">
                        <span class="fw-bold fs-6">${formatCurrency(itemTotal)}</span>
                    </div>

                    <!-- Remove Item Button -->
                    <button class="btn btn-sm text-danger p-1" onclick="removeItemFromCart(${index})" title="Remove item">
                        <i class="bi bi-trash fs-5"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    calculateCartTotals();
}

// Adjust Item Quantity
function updateItemQuantity(index, delta) {
    let cart = getCart();
    if (!cart[index]) return;

    cart[index].qty += delta;

    if (cart[index].qty <= 0) {
        const removedItemName = cart[index].name;
        cart.splice(index, 1);
        showToast(`Removed "${removedItemName}" from cart`, "info");
    }

    setCart(cart);
    renderCart();
}

// Remove Item Directly
function removeItemFromCart(index) {
    let cart = getCart();
    if (!cart[index]) return;

    const removedItemName = cart[index].name;
    cart.splice(index, 1);
    setCart(cart);
    showToast(`Removed "${removedItemName}" from cart`, "info");
    renderCart();
}

// Clear Entire Cart
function clearEntireCart() {
    if (confirm("Are you sure you want to empty your cart?")) {
        setCart([]);
        appliedCoupon = null;
        showToast("Cart has been cleared.", "info");
        renderCart();
    }
}

// Calculate Subtotal, Tax, Delivery & Grand Total
function calculateCartTotals() {
    const cart = getCart();
    const settings = getSettings();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Free delivery check (e.g. Free if >= ₹299)
    let deliveryFee = settings.deliveryFee || 40;
    if (subtotal >= (settings.freeDeliveryThreshold || 299) || subtotal === 0) {
        deliveryFee = 0;
    }

    // Taxes (5% GST standard)
    const tax = Math.round(subtotal * ((settings.taxPercent || 5) / 100));

    // Calculate Promo Discount
    let discount = 0;
    if (appliedCoupon && subtotal > 0) {
        if (subtotal >= (appliedCoupon.minOrder || 0)) {
            if (appliedCoupon.discountPercent) {
                discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
                if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
                    discount = appliedCoupon.maxDiscount;
                }
            } else if (appliedCoupon.discountAmount) {
                discount = appliedCoupon.discountAmount;
            }
        } else {
            // Min order not met anymore
            appliedCoupon = null;
            showToast("Coupon removed: Cart value is below minimum requirement.", "warning");
        }
    }

    const grandTotal = Math.max(0, subtotal + deliveryFee + tax - discount);

    // Update DOM
    const subtotalEl = document.getElementById('summarySubtotal');
    const deliveryEl = document.getElementById('summaryDelivery');
    const taxEl = document.getElementById('summaryTax');
    const discountRowEl = document.getElementById('summaryDiscountRow');
    const discountEl = document.getElementById('summaryDiscount');
    const grandTotalEl = document.getElementById('summaryGrandTotal');
    const freeDeliveryNoticeEl = document.getElementById('freeDeliveryNotice');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (deliveryEl) {
        deliveryEl.textContent = deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee);
        if (deliveryFee === 0) deliveryEl.classList.add('text-success', 'fw-bold');
        else deliveryEl.classList.remove('text-success', 'fw-bold');
    }
    if (taxEl) taxEl.textContent = formatCurrency(tax);

    if (discountRowEl && discountEl) {
        if (discount > 0) {
            discountRowEl.classList.remove('d-none');
            discountEl.textContent = `- ${formatCurrency(discount)}`;
        } else {
            discountRowEl.classList.add('d-none');
        }
    }

    if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

    if (freeDeliveryNoticeEl) {
        if (subtotal >= 299) {
            freeDeliveryNoticeEl.innerHTML = `<i class="bi bi-check-circle-fill text-success me-1"></i> Yay! You unlocked <strong>FREE Delivery</strong>!`;
        } else {
            const diff = 299 - subtotal;
            freeDeliveryNoticeEl.innerHTML = `<i class="bi bi-info-circle text-primary me-1"></i> Add <strong>${formatCurrency(diff)}</strong> more to get <strong>FREE Delivery</strong>!`;
        }
    }

    // Persist current calculated summary for checkout.html
    sessionStorage.setItem('sukoon_order_breakdown', JSON.stringify({
        subtotal,
        deliveryFee,
        tax,
        discount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        grandTotal
    }));
}

// Apply Promo Coupon
function applyCouponCode() {
    const input = document.getElementById('couponCodeInput');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        showToast("Please enter a promo code.", "warning");
        return;
    }

    const settings = getSettings();
    const coupon = (settings.coupons || []).find(c => c.code.toUpperCase() === code);

    if (!coupon) {
        showToast("Invalid promo coupon code.", "error");
        return;
    }

    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (coupon.minOrder && subtotal < coupon.minOrder) {
        showToast(`This coupon requires a minimum cart total of ${formatCurrency(coupon.minOrder)}.`, "warning");
        return;
    }

    appliedCoupon = coupon;
    showToast(`Coupon "${coupon.code}" applied! You saved on this order.`, "success");
    calculateCartTotals();
}

// Remove Coupon
function removeCoupon() {
    appliedCoupon = null;
    showToast("Coupon removed.", "info");
    calculateCartTotals();
}

// Initialize on Cart page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cartItemsList')) {
        renderCart();
    }
});
