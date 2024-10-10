// Function to add an item to the cart
function addToCart(item) {
    // Get existing cart items from localStorage, or initialize with an empty array
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Check if item already exists in the cart
    let existingItem = cartItems.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
        // If item exists, update its quantity
        existingItem.quantity += item.quantity;
    } else {
        // If item does not exist, add it to the cart
        cartItems.push(item);
    }

    // Save the updated cart back to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Update the cart UI immediately
    updateCartUI();
}

// Function to load and display cart items when the page loads
function loadCartItems() {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Display items on the cart page
    if (cartItems.length > 0) {
        cartItems.forEach(item => {
            displayCartItem(item);
        });
    } else {
        document.getElementById('cart-items').innerHTML = "Your cart is empty!";
    }
}

// Function to display a single cart item in the UI
function displayCartItem(item) {
    let cartContainer = document.getElementById('cart-items');
    let itemHTML = `
        <div class="cart-item" id="cart-item-${item.id}">
            <span>${item.name}</span>
            <span>Quantity: ${item.quantity}</span>
            <span>Price: $${item.price}</span>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        </div>`;
    
    cartContainer.innerHTML += itemHTML;
}

// Function to update the cart UI (refresh all items)
function updateCartUI() {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = "";  // Clear the cart display

    if (cartItems.length > 0) {
        cartItems.forEach(item => {
            displayCartItem(item);
        });
    } else {
        cartContainer.innerHTML = "Your cart is empty!";
    }
}

// Function to remove an item from the cart
function removeFromCart(itemId) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Filter out the item to be removed
    cartItems = cartItems.filter(item => item.id !== itemId);

    // Update localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Refresh the cart UI
    updateCartUI();
}

// Function to clear the cart completely
function clearCart() {
    localStorage.removeItem('cartItems');
    updateCartUI(); // Optionally update the UI to reflect an empty cart
}

// Call this function when the cart page loads
window.onload = loadCartItems;
