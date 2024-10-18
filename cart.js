// Constants for rates
const taxRate = 0.05;
const shippingRate = 15.00;
const fadeTime = 300;

let cartContainer = document.getElementById('cartContainer');
let totalAmount = 0;

// Fetch products from the API and setup the cart
function fetchCartData() {
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function() {
        if (this.readyState === 4 && this.status == 200) {
            let contentTitle = JSON.parse(this.responseText);
            updateCart(contentTitle);
        } else if (this.readyState === 4) {
            console.log('Failed to fetch product data');
        }
    };

    httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
    httpRequest.send();
}

// Update cart based on cookies
function updateCart(contentTitle) {
    let cartItems = document.cookie.split('; ').find(row => row.startsWith('cart='));
    if (cartItems) {
        let items = cartItems.split('=')[1].split(','); // Assuming the cookie format is cart=item1,item2,...
        totalAmount = 0;

        items.forEach(itemId => {
            let item = contentTitle[itemId - 1]; // Adjust based on API data
            if (item) {
                let itemCount = items.filter(id => id === itemId).length; // Count occurrences
                totalAmount += item.price * itemCount;
                addProductToCart(item, itemCount);
            }
        });

        updateTotals();
    }
}

// Function to add a product row in the cart
function addProductToCart(item, quantity) {
    let productRow = document.createElement('div');
    productRow.className = 'product';

    productRow.innerHTML = `
        <div class="product-image">
            <img src="${item.preview}" alt="${item.name}">
        </div>
        <div class="product-details">
            <div class="product-title">${item.name}</div>
        </div>
        <div class="product-price">${item.price.toFixed(2)}</div>
        <div class="product-quantity">
            <input type="number" value="${quantity}" min="1" onchange="updateQuantity(this)">
        </div>
        <div class="product-removal">
            <button class="remove-product" onclick="removeItem(this)">Remove</button>
        </div>
        <div class="product-line-price">${(item.price * quantity).toFixed(2)}</div>
    `;

    cartContainer.appendChild(productRow);
}

// Update quantity and recalculate totals
function updateQuantity(quantityInput) {
    let productRow = quantityInput.closest('.product');
    let price = parseFloat(productRow.children('.product-price').textContent);
    let quantity = quantityInput.value;
    let linePrice = price * quantity;

    productRow.querySelector('.product-line-price').textContent = linePrice.toFixed(2);
    recalculateCart();
}

// Remove item from the cart
function removeItem(removeButton) {
    let productRow = removeButton.closest('.product');
    productRow.remove();
    recalculateCart();
}

// Recalculate cart totals
function recalculateCart() {
    let subtotal = 0;

    document.querySelectorAll('.product').forEach(function (product) {
        subtotal += parseFloat(product.querySelector('.product-line-price').textContent);
    });

    let tax = subtotal * taxRate;
    let shipping = (subtotal > 0 ? shippingRate : 0);
    let total = subtotal + tax + shipping;

    document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('cart-tax').textContent = tax.toFixed(2);
    document.getElementById('cart-shipping').textContent = shipping.toFixed(2);
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Fetch cart data on page load
fetchCartData();
