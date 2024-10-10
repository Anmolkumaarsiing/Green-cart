console.clear();

if (document.cookie.indexOf(',counter=') >= 0) {
    let counter = document.cookie.split(',')[1].split('=')[1];
    document.getElementById("badge").innerHTML = counter;
}

let cartContainer = document.getElementById('cartContainer');

let boxContainerDiv = document.createElement('div');
boxContainerDiv.id = 'boxContainer';

// DYNAMIC CODE TO SHOW THE SELECTED ITEMS IN YOUR CART
function dynamicCartSection(ob, itemCounter) {
    let boxDiv = document.createElement('div');
    boxDiv.id = 'box';
    boxContainerDiv.appendChild(boxDiv);

    let boxImg = document.createElement('img');
    boxImg.src = ob.preview;
    boxDiv.appendChild(boxImg);

    let boxh3 = document.createElement('h3');
    let h3Text = document.createTextNode(ob.name + ' × ' + itemCounter);
    boxh3.appendChild(h3Text);
    boxDiv.appendChild(boxh3);

    let boxh4 = document.createElement('h4');
    let h4Text = document.createTextNode('Amount: Rs ' + ob.price);
    boxh4.appendChild(h4Text);
    boxDiv.appendChild(boxh4);
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

    cartContainer.appendChild(boxContainerDiv);
    cartContainer.appendChild(totalContainerDiv);
    // Save the updated cart back to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    return cartContainer;
    // Update the cart UI immediately
    updateCartUI();
}

let totalContainerDiv = document.createElement('div');
totalContainerDiv.id = 'totalContainer';

let totalDiv = document.createElement('div');
totalDiv.id = 'total';
totalContainerDiv.appendChild(totalDiv);

let totalh2 = document.createElement('h2');
let h2Text = document.createTextNode('Total Amount');
totalh2.appendChild(h2Text);
totalDiv.appendChild(totalh2);

// TO UPDATE THE TOTAL AMOUNT
function amountUpdate(amount) {
    let totalh4 = document.createElement('h4');
    let totalh4Text = document.createTextNode('Amount: Rs ' + amount);
    totalh4Text.id = 'toth4';
    totalh4.appendChild(totalh4Text);
    totalDiv.appendChild(totalh4);
    totalDiv.appendChild(buttonDiv);
    console.log(totalh4);
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

let buttonDiv = document.createElement('div');
buttonDiv.id = 'button';
totalDiv.appendChild(buttonDiv);

let buttonTag = document.createElement('button');
buttonDiv.appendChild(buttonTag);

let buttonLink = document.createElement('a');
buttonLink.href = '#'; // This will be handled by JavaScript
buttonTag.appendChild(buttonLink);

buttonText = document.createTextNode('Place Order');
buttonTag.appendChild(buttonText);

// Function to initialize Razorpay
function initializeRazorpay(amount) {
    var options = {
        "key": "rzp_test_4sMuXigiNls8Jr", // Your Razorpay API key
        "amount": Math.round(amount * 100), // Convert rupees to paise and ensure it's an integer
        "currency": "INR",
        "name": "CARTER",
        "description": "Payment for Selected items",
        "image": "https://seeklogo.com/images/C/Carters-logo-DDDD28BA61-seeklogo.com.png", // Optional logo URL
        "handler": function (response) {
            alert("Payment successful: " + response.razorpay_payment_id);
            window.location.href = "/orderPlaced.html";
        },
        "theme": {
            "color": "#0d94fb"
        }
    };

    var paymentObject = new Razorpay(options);
    paymentObject.open();
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

// Modify button click event to call initializeRazorpay
buttonTag.onclick = function() {
    console.log("clicked");
    initializeRazorpay(totalAmount); // Ensure totalAmount is in rupees
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

// BACKEND CALL
let httpRequest = new XMLHttpRequest();
let totalAmount = 0;
httpRequest.onreadystatechange = function() {
    if (this.readyState === 4) {
        if (this.status == 200) {
            contentTitle = JSON.parse(this.responseText);
// Function to remove an item from the cart
function removeFromCart(itemId) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

            let counter = Number(document.cookie.split(',')[1].split('=')[1]);
            document.getElementById("totalItem").innerHTML = ('Total Items: ' + counter);
    // Filter out the item to be removed
    cartItems = cartItems.filter(item => item.id !== itemId);

            let item = document.cookie.split(',')[0].split('=')[1].split(" ");
            console.log(counter);
            console.log(item);
    // Update localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

            let i;
            totalAmount = 0; // Reset totalAmount before calculating
            for (i = 0; i < counter; i++) {
                let itemCounter = 1;
                for (let j = i + 1; j < counter; j++) {   
                    if (Number(item[j]) == Number(item[i])) {
                        itemCounter += 1;
                    }
                }
                totalAmount += Number(contentTitle[item[i] - 1].price) * itemCounter;
                dynamicCartSection(contentTitle[item[i] - 1], itemCounter);
                i += (itemCounter - 1);
            }
            amountUpdate(totalAmount);
        } else {
            console.log('call failed!');
        }
    }
    // Refresh the cart UI
    updateCartUI();
}

// Function to clear the cart completely
function clearCart() {
    localStorage.removeItem('cartItems');
    updateCartUI(); // Optionally update the UI to reflect an empty cart
}

httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
httpRequest.send();
// Call this function when the cart page loads
window.onload = loadCartItems;
