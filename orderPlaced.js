// Initialize cookie values
document.cookie = "orderId=" + 0 + ",counter=" + 0;

// Create the GET request for product data
let httpRequest = new XMLHttpRequest();
let jsonArray;
let method = "GET";
let jsonRequestURL = "https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData";

httpRequest.open(method, jsonRequestURL, true);
httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        // Convert JSON into a JavaScript object
        jsonArray = JSON.parse(httpRequest.responseText);
        console.log(jsonArray);
        
        // Add a new order object to the JSON array
        jsonArray.push({
            "id": jsonArray.length + 1, 
            "amount": 200, 
            "product": ["userOrder"]
        });

        // Send the updated data to the server using a POST request
        let httpRequest2 = new XMLHttpRequest();
        let method2 = "POST";
        let jsonRequestURL2 = "https://669e2f559a1bda368005b99b.mockapi.io/Product/orders";

        httpRequest2.open(method2, jsonRequestURL2, true);
        httpRequest2.setRequestHeader("Content-Type", "application/json"); // Set correct content type for JSON
        
        // Convert the updated jsonArray to a JSON string and send it
        httpRequest2.send(JSON.stringify(jsonArray)); 
    }
};

// Send the GET request
httpRequest.send(null);
