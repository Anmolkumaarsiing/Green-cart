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
                
                // Generate the invoice PDF
                generateInvoicePDF(transactionId, amount);
                
                // Redirect to order placed page after successfully posting transaction data
                window.location.href = "/orderPlaced.html";
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

//function to generate pdf
function generateInvoicePDF(transactionId, amount) {
    const gstRate = 0.18; 
    const deliveryChargeRate = 0.10; 
    const deliveryChargeCap = 20; 
    const subtotal = amount / (1 + gstRate + Math.min(deliveryChargeRate * amount, deliveryChargeCap) / amount);
    const totalGst = subtotal * gstRate; 
    const deliveryCharge = Math.min(deliveryChargeCap, deliveryChargeRate * subtotal); 
    const grandTotal = subtotal + totalGst + deliveryCharge; 

    const items = getItemDetailsFromCookies(); 
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add Header with background color
    doc.setFillColor(200, 200, 200);  // Light gray background
    doc.rect(10, 10, 190, 20, 'F');  // Rectangle for header background
    doc.setFontSize(18);
    doc.text("TAX INVOICE", 105, 25, null, null, 'center'); // Center aligned

    // Date and Company Information
    doc.setFontSize(12);
    doc.text(`DATE: ${new Date().toLocaleDateString('en-IN')}`, 150, 40);
    doc.text("GREEN CART", 14, 40);
    doc.text("Parul University, Vadodara, Gujarat, 391025", 14, 45);
    doc.text("Email: anmolkumaresiingh@gmail.com", 14, 50);

    // Customer Information
    doc.text("Bill of:", 14, 60);
    doc.text("Grocery items from Green Cart", 14, 65);

    doc.text("Payment Date: " + new Date().toLocaleDateString('en-IN'), 14, 75);
    doc.text("Payment Mode: Razorpay", 14, 80);

    // Add Table Header with color
    doc.setFillColor(100, 150, 255);  // Light blue for header
    doc.rect(10, 90, 190, 10, 'F');  // Table header background
    doc.setTextColor(255, 255, 255);  // White text for header
    doc.text("Description", 14, 97);
    doc.text("HSN Code", 80, 97);
    doc.text("Qty", 110, 97);
    doc.text("Rate", 140, 97);
    doc.text("Amount", 180, 97);

    // Reset text color to black for table content
    doc.setTextColor(0, 0, 0);

    // Items section with alternating row colors
    let currentY = 110;
    items.forEach((item, index) => {
        if (index % 2 === 0) {
            doc.setFillColor(240);  // Light gray
        } else {
            doc.setFillColor(255);  // White
        }
        doc.rect(10, currentY - 5, 190, 10, 'F');  // Apply fill to the row background
        doc.text(item.description, 14, currentY);
        doc.text("1234", 80, currentY); // Example HSN Code, replace with actual
        doc.text(item.qty.toString(), 110, currentY);
        doc.text(item.rate.toFixed(2), 140, currentY);
        doc.text(item.amount.toFixed(2), 180, currentY);
        currentY += 10;
    });

    // Totals Section
    currentY += 10;
    doc.text("Total", 140, currentY);
    doc.text(subtotal.toFixed(2), 180, currentY);
    currentY += 5;
    doc.text("CGST (9%)", 140, currentY);
    doc.text((totalGst / 2).toFixed(2), 180, currentY);
    currentY += 5;
    doc.text("SGST (9%)", 140, currentY);
    doc.text((totalGst / 2).toFixed(2), 180, currentY);
    currentY += 5;
    doc.text("Delivery Charges", 140, currentY);
    doc.text(deliveryCharge.toFixed(2), 180, currentY);

    // Grand Total
    currentY += 10;
    doc.setFontSize(14);
    doc.text("Grand Total", 140, currentY);
    doc.text(grandTotal.toFixed(2), 180, currentY);

    // Footer
    currentY += 20;
    doc.setFontSize(10);
    doc.text("Thank you for your purchase!", 14, currentY);
    doc.text("Please keep this invoice for your records.", 14, currentY + 5);

    // Authorized Signatory Section
    doc.setFontSize(12);
    doc.setFont("courier", "italic");
    const signatoryText = "Authorized Signatory: Anmol Singh";
    const signatoryX = doc.internal.pageSize.getWidth() - doc.getTextWidth(signatoryText) - 14;
    doc.text(signatoryText, signatoryX, currentY + 20);

    // Save the PDF
    doc.save(`Invoice_${transactionId}.pdf`);
}



// Get item details from cookies
function getItemDetailsFromCookies() {
    const cookieData = document.cookie.split(',')[0].split('=')[1].trim().split(" ");
    const items = [];
    cookieData.forEach((itemIndex) => {
        const index = Number(itemIndex) - 1; // Adjusting for zero-based index
        if (contentTitle && contentTitle[index]) { // Check if contentTitle is defined and item exists
            items.push({
                description: contentTitle[index].name,
                hsnCode: '1234', // Placeholder HSN Code
                qty: 1, // Assuming quantity is 1 for simplicity
                rate: contentTitle[index].price,
                amount: contentTitle[index].price
            });
        }
    });
    return items; // Return items array
}

// BACKEND CALL
let httpRequest = new XMLHttpRequest();
let totalAmount = 0;

httpRequest.onreadystatechange = function() {
    if (this.readyState === 4) {
        if (this.status == 200) {
            contentTitle = JSON.parse(this.responseText); // Declare contentTitle here
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
                    amountUpdate(totalAmount); // Call amountUpdate with totalAmount
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
