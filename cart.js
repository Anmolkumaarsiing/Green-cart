console.clear();

if (document.cookie.indexOf(',counter=') >= 0) {
    let counter = document.cookie.split(',')[1].split('=')[1];
    document.getElementById("badge").innerHTML = counter;
}

let cartContainer = document.getElementById('cartContainer');

let boxContainerDiv = document.createElement('div');
boxContainerDiv.id = 'boxContainer';

// DYNAMIC CODE TO SHOW THE SELECTED ITEMS IN YOUR CART
function dynamicCartSection(ob, itemCounter, index) {
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

    // Create and append Remove button
    let removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = function() {
        removeItem(index, itemCounter, ob.price);
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

// TO UPDATE THE TOTAL AMOUNT
function amountUpdate(amount) {
    let existingAmount = document.getElementById('toth4');
    if (existingAmount) {
        existingAmount.textContent = 'Amount: Rs ' + amount;
    } else {
        let totalh4 = document.createElement('h4');
        totalh4.id = 'toth4';
        let totalh4Text = document.createTextNode('Amount: Rs ' + amount);
        totalh4.appendChild(totalh4Text);
        totalDiv.appendChild(totalh4);
    }
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

buttonText = document.createTextNode('Place Order');
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

// Function to remove an item from the cart
function removeItem(index, itemCounter, price) {
    // Update the cookie and the cart items
    let item = document.cookie.split(',')[0].split('=')[1].split(" ");
    item.splice(index, itemCounter); // Remove the item from the array
    document.cookie = 'items=' + item.join(' '); // Update cookie with the new items

    // Remove the item from the displayed cart
    let boxDivs = document.querySelectorAll('#boxContainer #box');
    if (boxDivs[index]) {
        boxDivs[index].remove();
    }

    // Update total amount
    totalAmount -= price * itemCounter;
    amountUpdate(totalAmount);
}

// BACKEND CALL
let httpRequest = new XMLHttpRequest();
let totalAmount = 0;
httpRequest.onreadystatechange = function() {
    if (this.readyState === 4) {
        if (this.status == 200) {
            contentTitle = JSON.parse(this.responseText);

            let counter = Number(document.cookie.split(',')[1].split('=')[1]);
            document.getElementById("totalItem").innerHTML = ('Total Items: ' + counter);

            let item = document.cookie.split(',')[0].split('=')[1].split(" ");
            console.log(counter);
            console.log(item);

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
                dynamicCartSection(contentTitle[item[i] - 1], itemCounter, i);
                i += (itemCounter - 1);
            }
            amountUpdate(totalAmount);
        } else {
            console.log('call failed!');
        }
    }
}

httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
httpRequest.send();
