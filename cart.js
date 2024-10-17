// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCrSBQoJDG9Cn5t2vsWNvDDkDQJm1UxTgk",
    authDomain: "green--cart.firebaseapp.com",
    databaseURL: "https://green--cart-default-rtdb.firebaseio.com",
    projectId: "green--cart",
    storageBucket: "green--cart.appspot.com",
    messagingSenderId: "997863065",
    appId: "1:997863065:web:1716dad07cdbe649e81208",
    measurementId: "G-56BY927ZLY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.clear();

// Initialize contentTitle
let contentTitle = []; // Declare contentTitle here

// Function to retrieve the item count from cookies
function getCounterFromCookies() {
    const cookieString = document.cookie; // Get the full cookie string
    let counter = 0; // Initialize the counter
    if (cookieString.indexOf(',counter=') >= 0) {
        const cookieParts = cookieString.split(','); // Split cookies by comma
        for (const part of cookieParts) {
            const [key, value] = part.split('='); // Split each part by '='
            if (key.trim() === 'counter') {
                counter = parseInt(value); // Parse the counter value
                break; // Stop searching after finding the counter
            }
        }
    }
    return counter; // Return the total count
}

// Initialize cart container
let cartContainer = document.getElementById('cartContainer');
let boxContainerDiv = document.createElement('div'); // Define boxContainerDiv
boxContainerDiv.id = 'boxContainer'; // Assign an ID for styling if needed
cartContainer.appendChild(boxContainerDiv); // Append it to the cart container

// DYNAMIC CODE TO SHOW THE SELECTED ITEMS IN YOUR CART
function dynamicCartSection(ob, itemCounter) {
    let boxDiv = document.createElement('div');
    boxDiv.id = 'box';
    boxDiv.className = 'cart-item'; // Added class for styling
    boxContainerDiv.appendChild(boxDiv); // Append to boxContainerDiv

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
}

// Initialize total and button divs
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
    totalh4.appendChild(totalh4Text);
    totalDiv.appendChild(totalh4);

    // Create and display the Place Order button
    createPlaceOrderButton(amount);
}

// Function to create and append the "Place Order" button
function createPlaceOrderButton(amount) {
    let buttonDiv = document.createElement('div');
    buttonDiv.id = 'button';

    let buttonTag = document.createElement('button');
    buttonTag.innerText = 'Place Order'; // Set button text
    buttonTag.onclick = function() {
        console.log("clicked");
        initializeRazorpay(amount); // Ensure amount is in rupees
    };

    buttonDiv.appendChild(buttonTag);
    totalDiv.appendChild(buttonDiv);
}

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
            saveOrderToFirestore(response.razorpay_payment_id); // Call function to save order
            window.location.href = "/orderPlaced.html";
        },
        "theme": {
            "color": "#0d94fb"
        }
    };

    var paymentObject = new Razorpay(options);
    paymentObject.open();
}

// Function to save order details to Firestore
async function saveOrderToFirestore(orderId) {
    const itemParts = document.cookie.split(',')[0].split('=');
    const items = itemParts.length > 1 ? itemParts[1].trim().split(" ") : [];
    const userEmail = "user@example.com"; // Replace with actual user email logic
    let totalItems = [];

    for (let itemId of items) {
        const item = contentTitle[itemId - 1]; // Get item details
        if (item) {
            totalItems.push({
                email: userEmail,
                id: item.id,
                name: item.name,
                orderdate: new Date().toISOString(),
                orderid: orderId,
                price: item.price,
                quantity: (itemCounts[itemId] || 0) // Get the quantity from itemCounts
            });
        }
    }

    // Save each item to Firestore
    for (let item of totalItems) {
        try {
            const docRef = await addDoc(collection(db, "orders"), item);
            console.log("Order saved with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
}

// BACKEND CALL
let httpRequest = new XMLHttpRequest();
let totalAmount = 0;
let itemCounts = {}; // Object to store item quantities

httpRequest.onreadystatechange = function() {
    if (this.readyState === 4 && this.status == 200) {
        contentTitle = JSON.parse(this.responseText); // Assign value to contentTitle here
        console.log("Current cookies:", document.cookie); // Log current cookies
        console.log("Content Title:", contentTitle); // Log the content title data to check the structure

        // Check for cookies and update cart
        const counter = getCounterFromCookies(); // Use the new function here
        document.getElementById("totalItem").innerHTML = `Total Items: ${counter}`;
        
        let itemParts = document.cookie.split(',')[0].split('=');
        if (itemParts.length > 1) {
            let items = itemParts[1].trim().split(" ");
            console.log("Items from cookie:", items); // Log the item IDs

            totalAmount = 0; // Reset totalAmount before calculating

            // Count item quantities
            for (let i = 0; i < items.length; i++) {
                itemCounts[items[i]] = (itemCounts[items[i]] || 0) + 1;
            }

            // Calculate total amount and dynamically show items
            for (const [itemId, itemCounter] of Object.entries(itemCounts)) {
                const itemIndex = itemId - 1; // Assuming itemId is 1-based index
                if (contentTitle[itemIndex]) {
                    dynamicCartSection(contentTitle[itemIndex], itemCounter);
                    totalAmount += contentTitle[itemIndex].price * itemCounter; // Accumulate total amount
                }
            }

            // Call amount update function
            amountUpdate(totalAmount);
        }
    }
};

httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
httpRequest.send();

