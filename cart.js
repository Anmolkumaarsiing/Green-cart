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
    let h4Text = document.createTextNode('Amount: Rs ' + (ob.price * itemCounter));
    boxh4.appendChild(h4Text);
    boxDiv.appendChild(boxh4);

    cartContainer.appendChild(boxContainerDiv);
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
    // Clear previous total if any
    totalDiv.innerHTML = '';
    
    let totalh4 = document.createElement('h4');
    let totalh4Text = document.createTextNode('Amount: Rs ' + amount);
    totalh4.appendChild(totalh4Text);
    totalDiv.appendChild(totalh4);
    
    // Append the button after total amount is updated
    buttonDiv = document.createElement('div');
    buttonDiv.id = 'button';
    totalDiv.appendChild(buttonDiv);

    let buttonTag = document.createElement('button');
    buttonTag.id = 'placeOrderButton';
    buttonDiv.appendChild(buttonTag);

    let buttonText = document.createTextNode('Place Order');
    buttonTag.appendChild(buttonText);

    // Attach event listener to button
    buttonTag.onclick = function() {
        console.log("Order placed");
        initializeRazorpay(amount); // Ensure totalAmount is in rupees
    };
}

let buttonDiv;

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
            sendOrderDetails(response.razorpay_payment_id); // Send order details after payment
            window.location.href = "/orderPlaced.html";
        },
        "theme": {
            "color": "#0d94fb"
        }
    };

    var paymentObject = new Razorpay(options);
    paymentObject.open();
}

// BACKEND CALL
let httpRequest = new XMLHttpRequest();
let totalAmount = 0;

httpRequest.onreadystatechange = function() {
    if (this.readyState === 4) {
        if (this.status == 200) {
            contentTitle = JSON.parse(this.responseText);
            console.log("Content Title Data:", contentTitle); // Check the data

            // Check for cookies
            if (document.cookie.indexOf(',counter=') >= 0) {
                let counter = Number(document.cookie.split(',')[1].split('=')[1]);
                document.getElementById("totalItem").innerHTML = ('Total Items: ' + counter);
                
                // Split cookies safely
                let itemParts = document.cookie.split(',')[0].split('=');
                if (itemParts.length > 1) {
                    let item = itemParts[1].trim().split(" ");
                    console.log("Items from cookie:", item);

                    // Calculate totalAmount and dynamically show items
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
                    console.error("Expected cookie format not found!");
                }
            }
        } else {
            console.log('call failed!');
        }
    }
}

httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
httpRequest.send();

// Function to send order details to the API
function sendOrderDetails(transactionId) {
    // Prepare the order data
    let orderData = [];
    let itemParts = document.cookie.split(',')[0].split('=');
    if (itemParts.length > 1) {
        let item = itemParts[1].trim().split(" ");
        for (let i = 0; i < item.length; i++) {
            let productIndex = Number(item[i]) - 1; // Adjust index
            
            // Check if the productIndex is within the bounds of contentTitle
            if (productIndex >= 0 && productIndex < contentTitle.length) {
                let productDetails = {
                    id: contentTitle[productIndex].id,
                    name: contentTitle[productIndex].name,
                    brand: contentTitle[productIndex].brand,
                    transactionId: transactionId,
                    createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) // Current date and time in IST
                };
                orderData.push(productDetails);
            } else {
                console.error(`Product index ${productIndex} is out of bounds for contentTitle array.`);
            }
        }

        // Send the order data to the orders API
        let httpRequest2 = new XMLHttpRequest();
        httpRequest2.open("POST", "https://669e2f559a1bda368005b99b.mockapi.io/Product/orders", true);
        httpRequest2.setRequestHeader("Content-Type", "application/json"); // Set the correct content type for JSON
        httpRequest2.send(JSON.stringify(orderData));
    }
}
