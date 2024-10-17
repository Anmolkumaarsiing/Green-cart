// Import Firestore methods from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

// Firebase configuration
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
const db = getFirestore(app); // Initialize Firestore

// API to fetch product data
let httpRequest = new XMLHttpRequest(),
    jsonArray,
    method = "GET",
    jsonRequestURL = "https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData";

httpRequest.open(method, jsonRequestURL, true);
httpRequest.onreadystatechange = async function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        // Convert JSON response to JavaScript object
        jsonArray = JSON.parse(httpRequest.responseText);
        
        // Retrieve the actual order ID from Razorpay (assumed to be saved in a variable or cookie)
        const orderId = getOrderIdFromRazorpay(); // Implement this function based on your logic

        // Get current date and logged-in user's email
        const orderDate = new Date().toISOString(); // Get current date
        const emailId = getLoggedInUserEmail(); // Implement this function based on your logic
        
        // Assuming we're placing an order for the first product in the fetched array
        // You may want to modify this logic to fetch the specific product that was ordered
        const product = jsonArray[0]; // Replace this with the logic to get the correct product

        // Example order data construction
        const orderData = {
            id: product.id, // Actual product ID
            name: product.name, // Actual product name
            quantity: 1, // Set order quantity (modify as needed)
            price: product.price, // Actual product price
            orderid: orderId, // Use the actual order ID here
            orderdate: orderDate,
            email: emailId // Use the actual logged-in user's email
        };

        // Send order data to Firestore
        try {
            await addDoc(collection(db, "orders"), orderData);
            console.log("Order placed successfully!", orderData);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }
};

// Send the initial request to fetch product data
httpRequest.send(null);

// Functions to retrieve order ID and user email (implement these based on your logic)
function getOrderIdFromRazorpay() {
    // Logic to retrieve the actual order ID after payment is processed
    // For example, you could fetch it from a cookie or a global variable
    return document.cookie.split('; ').find(row => row.startsWith('orderId=')).split('=')[1] || "sampleOrderId"; // Placeholder
}

function getLoggedInUserEmail() {
    // Logic to retrieve the logged-in user's email from your authentication system
    return "user@example.com"; // Replace with actual logic to get the user's email
}
