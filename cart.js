console.clear();

if (document.cookie.indexOf(',counter=') >= 0) {
    let counter = document.cookie.split(',')[1].split('=')[1];
    document.getElementById("badge").innerHTML = counter;
}

let cartContainer = document.getElementById('cartContainer');

let boxContainerDiv = document.createElement('div');
boxContainerDiv.id = 'boxContainer';

// Firebase Initialization (Ensure your firebaseConfig is correct)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

// Function to save order to Firestore
function saveOrderToFirestore(paymentId, totalAmount) {
    let userId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'guest';

    // Create an order object with the necessary details
    let orderData = {
        userId: userId, // Save user ID or 'guest'
        paymentId: paymentId, // Razorpay payment ID
        totalAmount: totalAmount, // Total order amount
        timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Timestamp of the order
        items: [] // This will hold the cart items
    };

    // Fetch the cart items from cookies
    let itemParts = document.cookie.split(',')[0].split('=');
    let items = itemParts.length > 1 ? itemParts[1].trim().split(" ") : [];
    
    items.forEach(item => {
        orderData.items.push({
            productId: item, // Assuming item has an id property
            quantity: 1 // Assuming each item is ordered once, modify if you track quantities differently
        });
    });

    // Save the order data to Firestore
    db.collection('orders').add(orderData)
        .then(() => {
            console.log("Order successfully saved to Firestore!");
        })
        .catch((error) => {
            console.error("Error saving order: ", error);
        });
}

// Function to initialize Razorpay
function initializeRazorpay(amount) {
    var options = {
        "key": "rzp_test_4sMuXigiNls8Jr", // Your Razorpay API key
        "amount": Math.round(amount * 100), // Convert rupees to paise
        "currency": "INR",
        "name": "CARTER",
        "description": "Payment for Selected items",
        "image": "https://seeklogo.com/images/C/Carters-logo-DDDD28BA61-seeklogo.com.png", // Optional logo URL
        "handler": function (response) {
            alert("Payment successful: " + response.razorpay_payment_id);
            // Save order details to Firestore
            saveOrderToFirestore(response.razorpay_payment_id, totalAmount);
            window.location.href = "/orderPlaced.html"; // Redirect to order confirmation page
        },
        "theme": {
            "color": "#0d94fb"
        }
    };

    var paymentObject = new Razorpay(options);
    paymentObject.open();
}

// Modify button click event to call initializeRazorpay
buttonTag.onclick = function() {
    console.log("clicked");
    initializeRazorpay(totalAmount); // Ensure totalAmount is in rupees
}

// BACKEND CALL
let httpRequest = new XMLHttpRequest();
let totalAmount = 0;

httpRequest.onreadystatechange = function() {
    if (this.readyState === 4) {
        if (this.status == 200) {
            contentTitle = JSON.parse(this.responseText);
            console.log("Current cookies:", document.cookie); // Log current cookies

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
