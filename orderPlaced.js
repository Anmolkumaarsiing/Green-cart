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

// Reset cookies
document.cookie = "orderId=" + 0 + ",counter=" + 0;

let httpRequest = new XMLHttpRequest();
let method = "GET";
let jsonRequestURL = "https://669e2f559a1bda368005b99b.mockapi.io/Product/productdata";

httpRequest.open(method, jsonRequestURL, true);
httpRequest.onreadystatechange = async function() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        // Convert JSON into JavaScript object
        let jsonArray = JSON.parse(httpRequest.responseText);
        console.log(jsonArray);

        // Example: Assuming we have a product to order (replace this logic as needed)
        let orderDetails = {
            productId: jsonArray[0].id, // Get product ID from the first item
            productName: jsonArray[0].name, // Get product name
            orderQuantity: 1, // Adjust this based on user selection
            price: jsonArray[0].price, // Get price from the first item
            orderId: getCookieValue("orderId"), // Get Razorpay order ID from cookie
            orderDate: new Date().toISOString(), // Get the current date
            email: "user@example.com" // Replace this with the actual email from the logged-in user
        };

        try {
            // Save order details to Firestore
            const docRef = await addDoc(collection(db, "orders"), orderDetails);
            console.log("Order saved with ID: ", docRef.id);

            // Reset the order cookies after saving
            document.cookie = "orderId=" + 0 + ",counter=" + 0;
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
};

// Send the initial GET request
httpRequest.send(null);

// Function to retrieve cookie value by name
function getCookieValue(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
        return match[2];
    }
    return null;
}
