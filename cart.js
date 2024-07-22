console.clear();

if (document.cookie.indexOf(',counter=') >= 0) {
    let counter = document.cookie.split(',')[1].split('=')[1];
    document.getElementById("badge").innerHTML = counter;
}

let cartContainer = document.getElementById('cartContainer');

let boxContainerDiv = document.createElement('div');
boxContainerDiv.id = 'boxContainer';

// Function to create cart item box with remove button
function dynamicCartSection(ob, itemCounter, itemIndex) {
    let boxDiv = document.createElement('div');
    boxDiv.id = 'box';
    boxDiv.dataset.index = itemIndex;
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
    boxh4.dataset.price = ob.price;
    boxh4.className = 'item-amount';
    boxh4.appendChild(h4Text);
    boxDiv.appendChild(boxh4);

    // Remove button
    let removeButton = document.createElement('button');
    removeButton.innerText = 'Remove';
    removeButton.onclick = function() {
        removeFromCart(itemIndex);
    };
    boxDiv.appendChild(removeButton);

    cartContainer.appendChild(boxContainerDiv);
    cartContainer.appendChild(totalContainerDiv);

    return cartContainer;
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

// Function to update the total amount
function amountUpdate(amount) {
    totalDiv.querySelectorAll('h4').forEach(h4 => h4.remove());
    let totalh4 = document.createElement('h4');
    let totalh4Text = document.createTextNode('Amount: Rs ' + amount);
    totalh4.id = 'toth4';
    totalh4.appendChild(totalh4Text);
    totalDiv.appendChild(totalh4);
    totalDiv.appendChild(buttonDiv);
    console.log(totalh4);
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
            window.location.href = "/orderPlaced.html";
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

// Remove item from cart
function removeFromCart(index) {
    let items = document.cookie.split(',')[0].split('=')[1].split(" ");
    items.splice(index, 1);
    let counter = items.length;
    document.cookie = `items=${items.join(' ')},counter=${counter}`;
    refreshCart();
}

// Function to refresh the cart display
function refreshCart() {
    cartContainer.innerHTML = '';
    boxContainerDiv.innerHTML = '';
    totalContainerDiv.innerHTML = '';
    totalAmount = 0;

    // Re-fetch and display cart items
    httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
    httpRequest.send();
}

// Backend call to fetch and display cart items
let httpRequest = new XMLHttpRequest();
let totalAmount = 0;
httpRequest.onreadystatechange = function() {
    if (this.readyState === 4) {
        if (this.status == 200) {
            contentTitle = JSON.parse(this.responseText);

            let counter = Number(document.cookie.split(',')[1].split('=')[1]);
            document.getElementById("totalItem").innerHTML = 'Total Items: ' + (isNaN(counter) ? 0 : counter);

            let items = document.cookie.split(',')[0].split('=')[1].split(" ");
            console.log(counter);
            console.log(items);

            let itemCounts = {}; // To keep track of item quantities
            items.forEach(item => {
                itemCounts[item] = (itemCounts[item] || 0) + 1;
            });

            for (let [itemId, itemCounter] of Object.entries(itemCounts)) {
                if (itemId > 0 && itemId <= contentTitle.length) {
                    totalAmount += Number(contentTitle[itemId - 1].price) * itemCounter;
                    dynamicCartSection(contentTitle[itemId - 1], itemCounter, items.indexOf(itemId));
                }
            }

            amountUpdate(totalAmount);
        } else {
            console.log('call failed!');
        }
    }
}

httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
httpRequest.send();
