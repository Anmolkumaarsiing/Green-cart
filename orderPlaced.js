document.cookie = "orderId=" + 0 + ",counter=" + 0;

let httpRequest = new XMLHttpRequest(),
    jsonArray,
    method = "GET",
    jsonRequestURL = "https://5d76bf96515d1a0014085cf9.mockapi.io/order";

// Step 1: Fetch existing order data
httpRequest.open(method, jsonRequestURL, true);
httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        // Convert JSON into JavaScript object
        jsonArray = JSON.parse(httpRequest.responseText);
        console.log(jsonArray);

        // Step 2: Add a new order object to the array
        jsonArray.push({
            "id": (jsonArray.length) + 1,
            "amount": 200,
            "product": ["userOrder"]
        });

        // Step 3: Send the updated JSON array to the local API
        const orderDetailsURL = "orderdetails.json"; // URL of your local orderdetails.json file

        // Create a new POST request
        let postRequest = new XMLHttpRequest();
        postRequest.open("POST", orderDetailsURL, true);
        postRequest.setRequestHeader("Content-Type", "application/json"); // Set content type to JSON

        // Step 4: Send the updated jsonArray as a JSON string
        postRequest.send(JSON.stringify(jsonArray));

        // Step 5: Handle the response for the POST request
        postRequest.onreadystatechange = function () {
            if (postRequest.readyState == 4) {
                if (postRequest.status == 200) {
                    console.log("Data posted successfully:", postRequest.responseText);
                } else {
                    console.error("Error posting data:", postRequest.statusText);
                }
            }
        };
    }
};

// Step 6: Send the initial GET request
httpRequest.send(null);
