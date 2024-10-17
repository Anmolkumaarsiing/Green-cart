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
let contentTitle = [];

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

    cartContainer.appendChild(boxContainerDiv);
    cartContainer.appendChild(totalContainerDiv);
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
    totalh4.appendChild(totalh4Text);
    totalDiv.appendChild(totalh4);
    totalDiv.appendChild(buttonDiv);
}

let buttonDiv = document.createElement('div');
buttonDiv.id = 'button';
totalDiv.appendChild(buttonDiv);

let buttonTag = document.createElement('button');
buttonDiv.appendChild(buttonTag);

let buttonLink = document.createElement('a');
buttonLink.href = '#'; // This will be handled by JavaScript
buttonTag.appendChild(buttonLink);

let buttonText = document.createTextNode('Place Order');
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
    // Get the logged-in user's email from the Firestore database
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // Assuming you're storing user ID here
    const userDocRef = doc(db, "users", loggedInUserId);
    const userDoc = await getDoc(userDocRef);
    const userEmail = userDoc.exists() ? userDoc.data().email : "unknown@example.com"; // Default email if user doesn't exist

    const orderDetails = {
        items: [], // Initialize as an empty array
        orderDate: new Date().toISOString(),
        orderId: orderId,
        totalAmount: totalAmount,
        userId: userEmail // Store user email instead of user ID
    };

    // Fill items with names instead of IDs
    const itemParts = document.cookie.split(',')[0].split('=');
    if (itemParts.length > 1) {
        const itemIds = itemParts[1].trim().split(" ");
        
        for (const itemId of itemIds) {
            const itemIndex = itemId - 1; // Assuming itemId is 1-based
            const item = contentTitle[itemIndex]; // Get the item from contentTitle
            if (item) {
                orderDetails.items.push(item.name); // Push product name into the items array
            }
        }
    }

    try {
        const docRef = await addDoc(collection(db, "orders"), orderDetails);
        console.log("Order saved with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Modify button click event to call initializeRazorpay
buttonTag.onclick = function() {
    console.log("clicked");
    initializeRazorpay(totalAmount); // Ensure totalAmount is in rupees
}

// Function to extract the item counter from cookies
function getCounterFromCookies() {
    if (document.cookie.indexOf(',counter=') >= 0) {
        return Number(document.cookie.split(',')[1].split('=')[1]);
    }
    return 0;
}

// BACKEND CALL
let httpRequest = new XMLHttpRequest();
let totalAmount = 0;

httpRequest.onreadystatechange = function() {
    if (this.readyState === 4 && this.status == 200) {
        contentTitle = JSON.parse(this.responseText); // Assign value to contentTitle here
        console.log("Current cookies:", document.cookie); // Log current cookies
        console.log("Content Title:", contentTitle); // Log the content title data to check the structure

        // Check for cookies and update cart
        const counter = getCounterFromCookies();
        document.getElementById("totalItem").innerHTML = `Total Items: ${counter}`;
        
        let itemParts = document.cookie.split(',')[0].split('=');
        if (itemParts.length > 1) {
            let items = itemParts[1].trim().split(" ");
            console.log("Items from cookie:", items); // Log the item IDs

            totalAmount = 0; // Reset totalAmount before calculating
            let itemCounts = {}; // Object to count item quantities

            // Count item quantities
            for (let i = 0; i < items.length; i++) {
                itemCounts[items[i]] = (itemCounts[items[i]] || 0) + 1;
            }

            // Calculate total amount and dynamically show items
            for (const [itemId, itemCounter] of Object.entries(itemCounts)) {
                const itemIndex = itemId - 1; // Assuming itemId is 1-based
                const item = contentTitle[itemIndex]; // Get the item from contentTitle

                if (item) {
                    totalAmount += Number(item.price) * itemCounter;
                    dynamicCartSection(item, itemCounter); // Use the item object
                } else {
                    console.warn(`Item with ID ${itemId} is not found in contentTitle.`); // Log a warning if item is not found
                }
            }

            // Update the total amount
            amountUpdate(totalAmount);
        }
    }
};

httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
httpRequest.send();
