console.clear();

if (document.cookie.indexOf(',counter=') >= 0) {
    let counter = document.cookie.split(',')[1].split('=')[1];
    document.getElementById("badge").innerHTML = counter;
}

let cartContainer = document.getElementById('cartContainer');
let totalContainerDiv = document.createElement('div');
totalContainerDiv.id = 'totalContainer';
cartContainer.appendChild(totalContainerDiv); // Append totalContainer to cartContainer

let totalDiv = document.createElement('div');
totalDiv.id = 'total';
totalContainerDiv.appendChild(totalDiv);

let totalh2 = document.createElement('h2');
totalh2.innerText = 'Total Amount';
totalDiv.appendChild(totalh2);

let buttonDiv = document.createElement('div');
buttonDiv.id = 'button';
totalDiv.appendChild(buttonDiv);

let buttonTag = document.createElement('button');
buttonTag.id = 'placeOrderButton';
buttonTag.innerText = 'Place Order';
buttonDiv.appendChild(buttonTag);

// Attach event listener to button
buttonTag.onclick = function () {
    console.log("Order placed");
    initializeRazorpay(0); // Initial dummy amount
};

let totalAmount = 0; // Total amount initialized

function dynamicCartSection(ob, itemCounter) {
    let boxDiv = document.createElement('div');
    boxDiv.id = 'box';
    cartContainer.appendChild(boxDiv);

    let boxImg = document.createElement('img');
    boxImg.src = ob.preview;
    boxDiv.appendChild(boxImg);

    let boxh3 = document.createElement('h3');
    boxh3.innerText = ob.name + ' × ' + itemCounter;
    boxDiv.appendChild(boxh3);

    let boxh4 = document.createElement('h4');
    boxh4.innerText = 'Amount: Rs ' + (ob.price * itemCounter);
    boxDiv.appendChild(boxh4);

    totalAmount += ob.price * itemCounter; // Update total amount
    amountUpdate(totalAmount);
}

function amountUpdate(amount) {
    totalDiv.innerHTML = ''; // Clear previous total
    totalh2.innerText = 'Total Amount';
    let totalh4 = document.createElement('h4');
    totalh4.innerText = 'Amount: Rs ' + amount;
    totalDiv.appendChild(totalh4);
    
    // Update button action
    buttonTag.onclick = function () {
        console.log("Order placed");
        initializeRazorpay(amount); // Use the updated total amount
    };
}

// Function to initialize Razorpay
function initializeRazorpay(amount) {
    var options = {
        "key": "rzp_test_4sMuXigiNls8Jr",
        "amount": Math.round(amount * 100),
        "currency": "INR",
        "name": "CARTER",
        "description": "Payment for Selected items",
        "image": "https://seeklogo.com/images/C/Carters-logo-DDDD28BA61-seeklogo.com.png",
        "handler": function (response) {
            alert("Payment successful: " + response.razorpay_payment_id);
            sendOrderDetails(response.razorpay_payment_id);
            window.location.href = "/orderPlaced.html";
        },
        "theme": {
            "color": "#0d94fb"
        }
    };

    var paymentObject = new Razorpay(options);
    paymentObject.open();
}

// Fetch cart items from the API
let httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function () {
    if (this.readyState === 4) {
        if (this.status === 200) {
            const contentTitle = JSON.parse(this.responseText);
            if (document.cookie.indexOf(',counter=') >= 0) {
                let counter = Number(document.cookie.split(',')[1].split('=')[1]);
                document.getElementById("totalItem").innerHTML = 'Total Items: ' + counter;
                let itemParts = document.cookie.split(',')[0].split('=');
                if (itemParts.length > 1) {
                    let item = itemParts[1].trim().split(" ");
                    for (let i = 0; i < counter; i++) {
                        let itemCounter = 1;
                        for (let j = i + 1; j < counter; j++) {
                            if (Number(item[j]) == Number(item[i])) {
                                itemCounter += 1;
                            }
                        }
                        dynamicCartSection(contentTitle[item[i] - 1], itemCounter);
                        i += (itemCounter - 1);
                    }
                }
            }
        } else {
            console.log('Failed to load data!');
        }
    }
};

httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
httpRequest.send();

// Function to send order details to the API
function sendOrderDetails(transactionId) {
    let orderData = [];
    let itemParts = document.cookie.split(',')[0].split('=');
    if (itemParts.length > 1) {
        let item = itemParts[1].trim().split(" ");
        for (let i = 0; i < item.length; i++) {
            let productIndex = Number(item[i]) - 1;
            if (productIndex >= 0 && productIndex < contentTitle.length) {
                let productDetails = {
                    id: contentTitle[productIndex].id,
                    name: contentTitle[productIndex].name,
                    brand: contentTitle[productIndex].brand,
                    transactionId: transactionId,
                    createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                };
                orderData.push(productDetails);
            }
        }
        let httpRequest2 = new XMLHttpRequest();
        httpRequest2.open("POST", "https://669e2f559a1bda368005b99b.mockapi.io/Product/orders", true);
        httpRequest2.setRequestHeader("Content-Type", "application/json");
        httpRequest2.send(JSON.stringify(orderData));
    }
}
