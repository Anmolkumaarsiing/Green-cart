// Initialize cookie values
document.cookie = "orderId=" + 0 + ",counter=" + 0;

// Create the GET request for product data
let httpRequest = new XMLHttpRequest();
let method = "GET";
let jsonRequestURL = "https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData";

httpRequest.open(method, jsonRequestURL, true);
httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        // Convert JSON into a JavaScript object
        let jsonArray = JSON.parse(httpRequest.responseText);
        console.log(jsonArray);

        // Assuming you have the Razorpay transaction ID from your payment process
        let transactionId = "YOUR_RAZORPAY_TRANSACTION_ID"; // Replace with actual transaction ID

        // Prepare data for the order
        let orderData = jsonArray.map(product => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            transactionId: transactionId,
            createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) // Current date and time in IST
        }));

        // Send the order data to the server using a POST request
        let httpRequest2 = new XMLHttpRequest();
        let method2 = "POST";
        let jsonRequestURL2 = "https://669e2f559a1bda368005b99b.mockapi.io/Product/orders";

        httpRequest2.open(method2, jsonRequestURL2, true);
        httpRequest2.setRequestHeader("Content-Type", "application/json"); // Set correct content type for JSON
        
        // Send the order data as a JSON string
        httpRequest2.send(JSON.stringify(orderData));
    }
};

// Send the GET request
httpRequest.send(null);
