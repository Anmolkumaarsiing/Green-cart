console.clear();

// Initialize cart from localStorage if it exists, otherwise from cookies
function initializeCart() {
    let storedCart = JSON.parse(localStorage.getItem('cartItems')) || null;
    if (storedCart) {
        let totalAmount = 0;
        let counter = storedCart.length;
        document.getElementById("totalItem").innerHTML = ('Total Items: ' + counter);
        
        // Load items from localStorage and render them
        storedCart.forEach(item => {
            dynamicCartSection(item.product, item.quantity);
            totalAmount += item.product.price * item.quantity;
        });

        amountUpdate(totalAmount); // Update the total amount
    } else {
        // Fallback to loading from cookies (current logic)
        if (document.cookie.indexOf(',counter=') >= 0) {
            let counter = document.cookie.split(',')[1].split('=')[1];
            document.getElementById("badge").innerHTML = counter;

            // Fetch products from API and dynamically build the cart UI
            loadItemsFromApi(counter);
        }
    }
}

// Function to load items from API (if using cookies for initial load)
function loadItemsFromApi(counter) {
    let httpRequest = new XMLHttpRequest();
    let totalAmount = 0;
    httpRequest.onreadystatechange = function() {
        if (this.readyState === 4 && this.status == 200) {
            let contentTitle = JSON.parse(this.responseText);
            let item = document.cookie.split(',')[0].split('=')[1].split(" ");

            totalAmount = 0; // Reset totalAmount before calculating
            for (let i = 0; i < counter; i++) {
                let itemCounter = 1;
                for (let j = i + 1; j < counter; j++) {   
                    if (Number(item[j]) == Number(item[i])) {
                        itemCounter += 1;
                    }
                }
                let product = contentTitle[item[i] - 1];
                totalAmount += product.price * itemCounter;

                dynamicCartSection(product, itemCounter);
                i += (itemCounter - 1);
            }
            amountUpdate(totalAmount);
        } else {
            console.log('API call failed!');
        }
    };

    httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
    httpRequest.send();
}

// Function to dynamically render cart items
function dynamicCartSection(ob, itemCounter) {
    let cartContainer = document.getElementById('cartContainer');
    let boxContainerDiv = document.createElement('div');
    boxContainerDiv.id = 'boxContainer';
    
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
}

// Function to update the total amount
function amountUpdate(amount) {
    let totalContainerDiv = document.getElementById('totalContainer') || document.createElement('div');
    totalContainerDiv.id = 'totalContainer';
    
    let totalDiv = document.createElement('div');
    totalDiv.id = 'total';
    totalContainerDiv.appendChild(totalDiv);

    let totalh2 = document.createElement('h2');
    let h2Text = document.createTextNode('Total Amount');
    totalh2.appendChild(h2Text);
    totalDiv.appendChild(totalh2);

    let totalh4 = document.createElement('h4');
    totalh4.id = 'toth4';
    let totalh4Text = document.createTextNode('Amount: Rs ' + amount);
    totalh4.appendChild(totalh4Text);
    totalDiv.appendChild(totalh4);

    // Add the place order button
    let buttonDiv = document.createElement('div');
    buttonDiv.id = 'button';
    totalDiv.appendChild(buttonDiv);

    let buttonTag = document.createElement('button');
    buttonTag.innerText = 'Place Order';
    buttonTag.onclick = function() {
        initializeRazorpay(amount); // Call Razorpay
    };

    totalDiv.appendChild(buttonTag);
    document.getElementById('cartMainContainer').appendChild(totalContainerDiv);
}

// Function to initialize Razorpay payment
function initializeRazorpay(amount) {
    var options = {
        "key": "rzp_test_4sMuXigiNls8Jr",
        "amount": Math.round(amount * 100), // Amount in paise
        "currency": "INR",
        "name": "CARTER",
        "description": "Payment for Selected items",
        "image": "https://seeklogo.com/images/C/Carters-logo-DDDD28BA61-seeklogo.com.png",
        "handler": function(response) {
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

// Initialize the cart on page load
window.onload = initializeCart;

