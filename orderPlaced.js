// orderPlaced.js
// Make sure this file is treated as a module as well

import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

// Reference to Firestore
const db = getFirestore(); // Ensure that you have initialized your Firestore instance

// Replace the original order placing logic with Firestore logic
document.cookie = "orderId=" + 0 + ",counter=" + 0;

let httpRequest = new XMLHttpRequest(),
    jsonArray,
    method = "GET",
    jsonRequestURL = "https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData";

httpRequest.open(method, jsonRequestURL, true);
httpRequest.onreadystatechange = async function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        // Convert JSON into JavaScript object
        jsonArray = JSON.parse(httpRequest.responseText);
        console.log(jsonArray);
        
        // Sample values (You can get these from user input or other sources)
        const orderId = "sampleOrderId"; // This should come from Razorpay
        const orderDate = new Date().toISOString(); // Get current date
        const emailId = "user@example.com"; // Retrieve from logged-in user context
        
        // Push new order data
        const orderData = {
            id: jsonArray.length + 1, // product ID
            name: jsonArray[0].name, // Assuming you want to get the first product's name
            quantity: 1, // Order quantity (example)
            price: jsonArray[0].price, // Get the price of the first product
            orderid: orderId,
            orderdate: orderDate,
            email: emailId
        };

        // Send to Firestore
        try {
            await addDoc(collection(db, "orders"), orderData);
            console.log("Order placed successfully!", orderData);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }
};
httpRequest.send(null);
