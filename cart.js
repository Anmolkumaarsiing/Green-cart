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
let totalAmount = 0; // Declare totalAmount here

// Function to get item count from cookies
function getCounterFromCookies() {
    const counterCookie = document.cookie.split(',').find(cookie => cookie.includes('counter='));
    return counterCookie ? Number(counterCookie.split('=')[1]) : 0;
}

// Update badge with item counter
const counter = getCounterFromCookies();
document.getElementById("badge").innerHTML = counter;

// Initialize cart container
let cartContainer = document.getElementById('cartContainer');
let boxContainerDiv = document.createElement('div');
boxContainerDiv.id = 'boxContainer';
cartContainer.appendChild(boxContainerDiv);

// Create total container
let totalContainerDiv = document.createElement('div');
totalContainerDiv.id = 'totalContainer';
cartContainer.appendChild(totalContainerDiv);

let totalDiv = document.createElement('div');
totalDiv.id = 'total';
totalContainerDiv.appendChild(totalDiv);

// Function to dynamically show items in the cart
function dynamicCartSection(ob, itemCounter) {
    let boxDiv = document.createElement('div');
    boxDiv.className = 'box'; // Changed from id to class for multiple boxes
    boxContainerDiv.appendChild(boxDiv);

    let boxImg = document.createElement('img');
    boxImg.src = ob.preview;
    boxDiv.appendChild(boxImg);

    let boxh3 = document.createElement('h3');
    boxh3.textContent = `${ob.name} × ${itemCounter}`;
    boxDiv.appendChild(boxh3);

    let boxh4 = document.createElement('h4');
    boxh4.textContent = `Amount: Rs ${ob.price}`;
    boxDiv.appendChild(boxh4);
}

// Function to update total amount
function amountUpdate(amount) {
    totalDiv.innerHTML = ''; // Clear previous total
    let totalh2 = document.createElement('h2');
    totalh2.textContent = 'Total Amount';
    totalDiv.appendChild(totalh2);

    let totalh4 = document.createElement('h4');
    totalh4.textContent = `Amount: Rs ${amount}`;
    totalDiv.appendChild(totalh4);

    createPlaceOrderButton(); // Create the Place Order button
}

// Function to create the Place Order button
function createPlaceOrderButton() {
    let buttonDiv = document.createElement('div');
    buttonDiv.id = 'button';
    totalDiv.appendChild(buttonDiv);

    let buttonTag = document.createElement('button');
    buttonTag.textContent = 'Place Order';
    buttonDiv.appendChild(buttonTag);

    // Event listener for button click
    buttonTag.onclick = function () {
        console.log("clicked");
        initializeRazorpay(totalAmount); // Ensure totalAmount is in rupees
    };
}

// Function to initialize Razorpay
function initializeRazorpay(amount) {
    var options = {
        key: "rzp_test_4sMuXigiNls8Jr", // Your Razorpay API key
        amount: Math.round(amount * 100), // Convert rupees to paise
        currency: "INR",
        name: "CARTER",
        description: "Payment for Selected items",
        image: "https://seeklogo.com/images/C/Carters-logo-DDDD28BA61-seeklogo.com.png", // Optional logo URL
        handler: function (response) {
            alert("Payment successful: " + response.razorpay_payment_id);
            saveOrderToFirestore(response.razorpay_payment_id); // Call function to save order
            window.location.href = "/orderPlaced.html"; // Redirect after payment
        },
        theme: {
            color: "#0d94fb"
        }
    };

    var paymentObject = new Razorpay(options);
    paymentObject.open();
}

// Function to save order details to Firestore
async function saveOrderToFirestore(orderId) {
    const orderDetails = {
        items: document.cookie.split(',')[0].split('=')[1].trim().split(" "), // Assuming this holds the item IDs
        orderDate: new Date().toISOString(),
        orderId: orderId,
        totalAmount: totalAmount,
        userId: "exampleUserId" // Replace this with the actual user ID logic
    };

    try {
        const docRef = await addDoc(collection(db, "orders"), orderDetails);
        console.log("Order saved with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// BACKEND CALL
let httpRequest = new XMLHttpRequest();

httpRequest.onreadystatechange = function () {
    if (this.readyState === 4 && this.status == 200) {
        contentTitle = JSON.parse(this.responseText); // Assign value to contentTitle here
        console.log("Current cookies:", document.cookie); // Log current cookies

        // Check for cookies and update cart
        const counter = getCounterFromCookies();
        document.getElementById("totalItem").innerHTML = `Total Items: ${counter}`;
        
        let itemParts = document.cookie.split(',')[0].split('=');
        if (itemParts.length > 1) {
            let items = itemParts[1].trim().split(" ");
            console.log("Items from cookie:", items);

            totalAmount = 0; // Reset totalAmount before calculating
            let itemCounts = {}; // Object to count item quantities

            // Count item quantities
            for (let i = 0; i < items.length; i++) {
                itemCounts[items[i]] = (itemCounts[items[i]] || 0) + 1;
            }

            // Calculate total amount and dynamically show items
            for (const [itemId, itemCounter] of Object.entries(itemCounts)) {
                totalAmount += Number(contentTitle[itemId - 1].price) * itemCounter;
                dynamicCartSection(contentTitle[itemId - 1], itemCounter);
            }

            // Update the total amount
            amountUpdate(totalAmount);
        }
    }
};

httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
httpRequest.send();
