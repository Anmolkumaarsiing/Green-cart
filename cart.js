console.clear();

if (document.cookie.indexOf(',counter=') >= 0) {
    let counter = document.cookie.split(',')[1].split('=')[1];
    document.getElementById("badge").innerHTML = counter;
}

let cartContainer = document.getElementById('cartContainer');

let boxContainerDiv = document.createElement('div');
boxContainerDiv.id = 'boxContainer';

// Store previously generated order IDs
let generatedOrderIds = new Set();

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
function amountUpdate(subtotal) {
    let gst = subtotal * 0.18; // GST at 18%
    let deliveryCharge = Math.min(subtotal * 0.1, 20); // Delivery charge 10% or Rs 20, whichever is less
    let finalAmount = subtotal + gst + deliveryCharge;

    // Subtotal display
    let subtotalh4 = document.createElement('h4');
    let subtotalh4Text = document.createTextNode('Subtotal: Rs ' + subtotal.toFixed(2));
    subtotalh4.appendChild(subtotalh4Text);
    totalDiv.appendChild(subtotalh4);

    // GST display
    let gsth4 = document.createElement('h4');
    let gsth4Text = document.createTextNode('GST (18%): Rs ' + gst.toFixed(2));
    gsth4.appendChild(gsth4Text);
    totalDiv.appendChild(gsth4);

    // Delivery charge display
    let deliveryh4 = document.createElement('h4');
    let deliveryh4Text = document.createTextNode('Delivery Charges: Rs ' + deliveryCharge.toFixed(2));
    deliveryh4.appendChild(deliveryh4Text);
    totalDiv.appendChild(deliveryh4);

    // Final amount display
    let finalh4 = document.createElement('h4');
    let finalh4Text = document.createTextNode('Final Amount: Rs ' + finalAmount.toFixed(2));
    finalh4.appendChild(finalh4Text);
    totalDiv.appendChild(finalh4);

    // Update button click event to send final amount to Razorpay
    buttonTag.onclick = function() {
        console.log("clicked");
        initializeRazorpay(finalAmount); // Use the calculated final amount here
    };

    // Attach the button div for Razorpay
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
function initializeRazorpay(finalAmount) {
    var options = {
        "key": "rzp_test_4sMuXigiNls8Jr", // Your Razorpay API key
        "amount": Math.round(finalAmount * 100), // Convert rupees to paise and ensure it's an integer
        "currency": "INR",
        "name": "CARTER",
        "description": "Payment for Selected items",
        "image": "https://seeklogo.com/images/C/Carters-logo-DDDD28BA61-seeklogo.com.png", // Optional logo URL
        "handler": function (response) {
            // Payment successful
            alert("Payment successful: " + response.razorpay_payment_id);

            // Prepare data for the API request
            let orderData = {
                transactionId: response.razorpay_payment_id, // Razorpay transaction ID
                amount: finalAmount, // Final payment amount
                createdAt: getISTDateTime(), // Get current time in IST
                orderId: generateUniqueOrderId() // Generate unique order ID
            };

            // Send transaction data to the API
            postTransaction(orderData);
        },
        "theme": {
            "color": "#0d94fb"
        }
    };

    var paymentObject = new Razorpay(options);
    paymentObject.open();
}

// Function to generate a unique Order ID
function generateUniqueOrderId() {
    let orderId;
    do {
        orderId = generateOrderId();
    } while (generatedOrderIds.has(orderId)); // Keep generating until we find a unique one
    generatedOrderIds.add(orderId); // Add to the set of generated IDs
    return orderId;
}

// Helper function to generate the basic order ID format
function generateOrderId() {
    let date = new Date();
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Pad month to 2 digits
    let day = String(date.getDate()).padStart(2, '0'); // Pad day to 2 digits
    let randomNum = Math.floor(1000 + Math.random() * 9000); // Generate random 4-digit number
    return `GC${year}${month}${day}${randomNum}`; // Removed hyphen
}

// Function to get current IST date and time in ISO format
function getISTDateTime() {
    let date = new Date();

    // Convert UTC to IST (IST is UTC+5:30)
    date.setHours(date.getUTCHours() + 5);
    date.setMinutes(date.getUTCMinutes() + 30);

    return date.toISOString(); // Keep the ISO format
}

// Function to post transaction details to the provided API
function postTransaction(orderData) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open("POST", "https://669e2f559a1bda368005b99b.mockapi.io/Product/orders", true);
    httpRequest.setRequestHeader("Content-Type", "application/json");

    httpRequest.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status == 201) {
                console.log("Transaction successfully posted:", JSON.parse(this.responseText));
                // Redirect to order placed page after successfully posting transaction data
                window.location.href = "/orderPlaced.html";
            } else {
                console.error("Failed to post transaction data:", this.responseText);
            }
        }
    };

    // Send only the necessary fields as JSON string
    let cleanOrderData = {
        transactionId: orderData.transactionId,
        amount: orderData.amount,
        createdAt: orderData.createdAt, // Ensure this is in IST format
        orderId: orderData.orderId
    };

    httpRequest.send(JSON.stringify(cleanOrderData));
}

// Load cart items when the document is ready
document.addEventListener("DOMContentLoaded", function () {
    loadCartItems();
});

// Function to load cart items from API
function loadCartItems() {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let contentTitle = JSON.parse(this.responseText);
                let cookieData = document.cookie.split(',')[0].split('=');

                if (cookieData.length == 2) {
                    let item = cookieData[1].split(';');
                    let totalAmount = 0;
                    for (let i = 0; i < item.length; i++) {
                        let itemCounter = 0;
                        for (let j = 0; j < item.length; j++) {
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
    };

    httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
    httpRequest.send();
}
