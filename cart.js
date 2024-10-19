console.clear();

// Display item count from cookies
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
    let gst = amount * 0.18; // Calculate GST (18%)
    let deliveryCharge = Math.min(20, 0.10 * amount); // Delivery charges (10% of total or Rs 20, whichever is less)
    let finalAmount = amount + gst + deliveryCharge; // Calculate final amount

    // Set final amount globally
    window.finalAmount = finalAmount; // Set finalAmount as a global variable

    let totalh4 = document.createElement('h4');
    let totalh4Text = document.createTextNode('Subtotal: Rs ' + amount.toFixed(2));
    totalh4.appendChild(totalh4Text);
    totalDiv.appendChild(totalh4);

    let gsth4 = document.createElement('h4');
    let gstText = document.createTextNode('GST (18%): Rs ' + gst.toFixed(2));
    gsth4.appendChild(gstText);
    totalDiv.appendChild(gsth4);

    let deliveryh4 = document.createElement('h4');
    let deliveryText = document.createTextNode('Delivery Charges: Rs ' + deliveryCharge.toFixed(2));
    deliveryh4.appendChild(deliveryText);
    totalDiv.appendChild(deliveryh4);

    let finalh4 = document.createElement('h4');
    let finalText = document.createTextNode('Final Amount: Rs ' + finalAmount.toFixed(2));
    finalh4.appendChild(finalText);
    totalDiv.appendChild(finalh4);
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
            postTransaction(response.razorpay_payment_id, amount);
        },
        "theme": {
            "color": "#0d94fb"
        }
    };

    var paymentObject = new Razorpay(options);
    paymentObject.open();
}

// Modify button click event to call initializeRazorpay with final amount
buttonTag.onclick = function() {
    console.log("clicked");
    initializeRazorpay(window.finalAmount); // Use the final amount calculated in amountUpdate
}

// Function to post transaction details to the API
function postTransaction(transactionId, amount) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open("POST", "https://669e2f559a1bda368005b99b.mockapi.io/Product/orders", true);
    httpRequest.setRequestHeader("Content-Type", "application/json");

    httpRequest.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status == 201) {
                console.log("Transaction successfully posted:", JSON.parse(this.responseText));
                generateInvoice(transactionId, amount); // Generate invoice after posting transaction data
                window.location.href = "/orderPlaced.html"; // Redirect after generating invoice
            } else {
                console.error("Failed to post transaction data:", this.responseText);
            }
        }
    };

    // Generate the order ID
    const orderId = generateOrderId();
    
    // Get current date in IST format
    const createdAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Send only the necessary fields as JSON string
    let cleanOrderData = {
        transactionId: transactionId,
        amount: amount,
        createdAt: createdAt,
        orderId: orderId
    };

    httpRequest.send(JSON.stringify(cleanOrderData));
}

// Generate unique Order ID
function generateOrderId() {
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10).replace(/-/g, ""); // Format: YYYYMMDD
    const randomFourDigit = Math.floor(1000 + Math.random() * 9000); // Random 4 digit number
    return `GC${dateString}${randomFourDigit}`; // Format: GCYYYYMMDDXXXX
}

// Function to generate invoice PDF
function generateInvoice(transactionId, amount) {
    const { jsPDF } = window.jspdf; // Access jsPDF

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("en-IN");
    
    // Header
    doc.setFontSize(14);
    doc.text('TAX INVOICE', 14, 20);
    doc.text('DATE: ' + date, 14, 30);
    doc.text('GREEN CART', 14, 40);
    doc.text('Parul university, Vadodara, Gujarat, 391025', 14, 50);
    doc.text('Email ID: anmolkumaarsiingh@gmail.com', 14, 60);

    // Bill of Section
    doc.text('Bill of:', 14, 70);
    doc.text('Grocery items from Green cart', 14, 80);
    doc.text('Payment Date:', 14, 90);
    doc.text('Payment Mode:', 14, 100);

    // Table Header
    doc.setFontSize(12);
    doc.text('Description', 14, 110);
    doc.text('HSN Code', 80, 110);
    doc.text('Qty', 100, 110);
    doc.text('Rate', 120, 110);
    doc.text('Amount', 140, 110);

    // Add a line for each item in the cart
    // Here you would need to get the item details again if needed or pass them while generating the invoice
    // For demonstration, I'll just create a placeholder
    const items = ["Tomato", "Potato"]; // Replace this with actual items
    const prices = [25, 30]; // Replace this with actual prices
    const quantities = [1, 2]; // Replace this with actual quantities
    let y = 120;

    for (let i = 0; i < items.length; i++) {
        doc.text(items[i], 14, y);
        doc.text('HSN123', 80, y); // Example HSN code
        doc.text(quantities[i].toString(), 100, y);
        doc.text(prices[i].toString(), 120, y);
        doc.text((prices[i] * quantities[i]).toString(), 140, y);
        y += 10; // Adjust the position for the next row
    }

    // Total Section
    doc.text('Total', 14, y + 10);
    doc.text('Terms & conditions', 14, y + 20);
    doc.text('1.', 14, y + 30);
    doc.text('2.', 14, y + 40);
    doc.text('3.', 14, y + 50);
    doc.text('4.', 14, y + 60);
    doc.text('5.', 14, y + 70);
    doc.text('Add: CGST @ 9%', 14, y + 80);
    doc.text('Balance Received:', 14, y + 90);
    doc.text('Balance Due:', 14, y + 100);
    doc.text('Grand Total:', 14, y + 110);
    doc.text('Total Amount (₹ - In Words):', 14, y + 120);
    doc.text('authorised signature: Anmol kumar singh', 14, y + 130);

    // Save the PDF
    doc.save(`Invoice_${transactionId}.pdf`);
}

// BACKEND CALL
let httpRequest = new XMLHttpRequest();
let totalAmount = 0;

httpRequest.onreadystatechange = function() {
    if (this.readyState === 4) {
        if (this.status == 200) {
            let contentTitle = JSON.parse(this.responseText);
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
                        
                        // Ensure the item index is valid
                        let itemIndex = item[i] - 1; // Adjust for zero-based index
                        if (itemIndex >= 0 && itemIndex < contentTitle.length) {
                            totalAmount += Number(contentTitle[itemIndex].price) * itemCounter;
                            dynamicCartSection(contentTitle[itemIndex], itemCounter);
                        } else {
                            console.error("Item index out of bounds:", itemIndex);
                        }
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
