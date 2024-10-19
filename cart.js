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
            postTransaction(response.razorpay_payment_id, amount, response.razorpay_payment_mode); // Pass payment mode
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
function postTransaction(transactionId, amount, paymentMode) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open("POST", "https://669e2f559a1bda368005b99b.mockapi.io/Product/orders", true);
    httpRequest.setRequestHeader("Content-Type", "application/json");

    httpRequest.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status == 201) {
                console.log("Transaction successfully posted:", JSON.parse(this.responseText));
                generateInvoice(transactionId, amount, paymentMode); // Generate invoice after posting transaction data
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
        orderId: orderId,
        paymentMode: paymentMode // Include payment mode
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

// Function to convert number to words
function numberToWords(num) {
    const a = [ '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen' ];
    const b = [ '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety' ];
    const words = num.toString().split('.');
    let n = words[0].length > 3 ? words[0].slice(-3) : words[0]; // Get the last three digits
    let str = '';

    if (num < 20) {
        str = a[num];
    } else if (num < 100) {
        str = b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
    } else if (num < 1000) {
        str = a[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
    } else if (num < 1000000) {
        str = numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
    }

    if (words.length > 1) {
        str += ' and ' + words[1] + ' Paise';
    }

    return str || 'Zero';
}

// Function to generate invoice PDF
function generateInvoice(transactionId, amount, paymentMode) {
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
    doc.text('Bill of:', 14, 80);
    doc.text('Grocery items from Green cart', 14, 90);
    doc.text('Payment Date: ' + date, 14, 100);
    doc.text('Payment Mode: ' + paymentMode, 14, 110); // Add payment mode

    // Table Headers
    const headers = ["Description", "HSN Code", "Qty", "Rate", "Amount"];
    doc.autoTable({
        head: [headers],
        startY: 120,
        styles: { fontSize: 10 }
    });

    // Get order items from cookies
    let items = []; // Store item details
    if (document.cookie.indexOf(',counter=') >= 0) {
        let counter = Number(document.cookie.split(',')[1].split('=')[1]);
        let itemParts = document.cookie.split(',')[0].split('=');
        
        if (itemParts.length > 1) {
            let item = itemParts[1].trim().split(" ");
            for (let i = 0; i < counter; i++) {
                items.push(item[i]);
            }
        }
    }

    let totalAmount = 0;
    items.forEach((itemId, index) => {
        const product = JSON.parse(httpRequest.responseText).find(prod => prod.id === itemId);
        const quantity = 1; // Assuming 1 for now; adjust as needed
        const amount = product.price * quantity;

        // Populate table rows
        doc.autoTable({
            body: [[
                product.name, // Description
                'HSN123', // Example HSN code
                quantity.toString(), // Quantity
                product.price.toFixed(2), // Rate
                amount.toFixed(2) // Amount
            ]],
            startY: doc.autoTable.previous.finalY,
            styles: { fontSize: 10 }
        });

        totalAmount += amount;
    });

    // Total Section
    const gst = totalAmount * 0.18; // 18% GST
    const deliveryCharge = Math.min(20, 0.10 * totalAmount); // Delivery charges
    const finalAmount = totalAmount + gst + deliveryCharge;

    doc.text('Total Amount: Rs ' + totalAmount.toFixed(2), 14, doc.autoTable.previous.finalY + 10);
    doc.text('Add: CGST @ 9%: Rs ' + (gst / 2).toFixed(2), 14, doc.autoTable.previous.finalY + 20);
    doc.text('Add: SGST @ 9%: Rs ' + (gst / 2).toFixed(2), 14, doc.autoTable.previous.finalY + 30);
    doc.text('Balance Received: Rs ' + finalAmount.toFixed(2), 14, doc.autoTable.previous.finalY + 40);
    doc.text('Total Amount (₹ - In Words): ' + numberToWords(finalAmount).toUpperCase(), 14, doc.autoTable.previous.finalY + 50);
    
    // Terms and Conditions
    doc.text('Terms & Conditions:', 14, doc.autoTable.previous.finalY + 70);
    doc.text('1. No refunds after 30 days.', 14, doc.autoTable.previous.finalY + 80);
    doc.text('2. Keep your invoice for future reference.', 14, doc.autoTable.previous.finalY + 90);
    doc.text('3. Delivery charges are applicable on all orders.', 14, doc.autoTable.previous.finalY + 100);
    doc.text('4. Prices are subject to change.', 14, doc.autoTable.previous.finalY + 110);
    doc.text('5. Contact us for any disputes.', 14, doc.autoTable.previous.finalY + 120);

    // Authorised Signature
    doc.setFont("courier", "italic");
    doc.text('Authorised signature: Anmol Kumar Singh', 14, doc.autoTable.previous.finalY + 140);

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
