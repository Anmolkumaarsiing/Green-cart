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

    // Outer Border for the whole content
    doc.rect(5, 5, 200, 287);  // Outer border covering the entire content

    // Section 1: Tax Invoice Header
    doc.setFillColor(0, 102, 204);  // Blue background
    doc.setTextColor(255, 255, 255);  // White text
    doc.setFontSize(20);
    doc.setFont('Helvetica', 'bold');
    doc.rect(10, 10, 190, 15, 'F');  // Section 1 border
    doc.text("TAX INVOICE", 105, 20, null, null, 'center');  // Centered text

   // Define a gap size
const gap = 10; // 10 units gap

// Section 2: Green Cart Details (Increased width)
doc.setTextColor(0, 0, 0);  // Reset text color to black
doc.setFontSize(16);
doc.setFont('Helvetica', 'bold');
doc.rect(10, 30, 190, 30);  // Increased width for Section 2 border
doc.text("GREEN CART", 105, 40, null, null, 'center');  // Centered title
doc.setFontSize(12);
doc.setFont('Helvetica', 'normal');
doc.text("Parul University, Vadodara, Gujarat, 391025", 105, 50, null, null, 'center');
doc.text("Email: anmolkumaresiingh@gmail.com", 105, 55, null, null, 'center');

// Move down to the next section with a gap
let currentY = 60 + 30 + gap; // Adding height of Section 2 and the gap

// Section 3: Bill of and Payment Details
doc.setFontSize(12);
doc.rect(10, currentY, 190, 35);  // Section 3 border (Increased width)
doc.setFont('Helvetica', 'bold');
doc.text("Bill of:", 14, currentY + 10);  // Adjust text position within the new Y
doc.setFont('Helvetica', 'normal');
doc.text("Grocery items from Green Cart", 14, currentY + 15);  // Adjust text position within the new Y

// Left-side table in Section 3
doc.text("Payment Date: " + new Date().toLocaleDateString('en-IN'), 130, currentY + 10);  // Right side table content
doc.text("Payment Mode: Razorpay", 130, currentY + 15);  // Right side table content

// Move down to the next section with a gap
currentY += 35 + gap; // Adding height of Section 3 and the gap

// Section 4: Table Header for Items
doc.setFontSize(12);
doc.setFillColor(100, 150, 255);  // Light blue for table header
doc.setTextColor(255, 255, 255);  // White text for header
doc.rect(10, currentY, 190, 10, 'F');  // Section 4 header border (Increased width)
doc.text("Description", 14, currentY + 6);
doc.text("Serial no.", 80, currentY + 6);
doc.text("Qty", 110, currentY + 6);
doc.text("Rate", 140, currentY + 6);
doc.text("Amount", 180, currentY + 6);

// Move down to the next section with a gap
currentY += 10 + gap; // Adding height of Section 4 header and the gap

// Section 4: Table Content
doc.setTextColor(0, 0, 0);  // Reset text color to black for content
items.forEach((item, index) => {
    doc.rect(10, currentY - 5, 190, 10);  // Border for each row (Increased width)
    doc.text(item.description, 14, currentY);
    doc.text((index + 1).toString(), 80, currentY);
    doc.text(item.qty.toString(), 110, currentY);
    doc.text(item.rate.toFixed(2), 140, currentY);
    doc.text(item.amount.toFixed(2), 180, currentY);
    currentY += 10;  // Move down for the next row
});

    // Section 5: T&C and Amount Calculation
    currentY += 10;
    doc.rect(10, currentY, 190, 40);  // Section 5 border (Increased width)
    doc.setFontSize(10);
    doc.text("Terms & Conditions", 14, currentY + 10);
    doc.text("1. Goods once sold will not be returned.", 14, currentY + 15);
    doc.text("2. Please handle goods carefully.", 14, currentY + 20);

    // Right-side for amount calculation
    doc.setFontSize(12);
    let totalY = currentY + 5;
    doc.text("Subtotal:", 130, totalY);
    doc.text(subtotal.toFixed(2), 180, totalY);
    totalY += 5;
    doc.text("CGST (9%):", 130, totalY);
    doc.text((totalGst / 2).toFixed(2), 180, totalY);
    totalY += 5;
    doc.text("SGST (9%):", 130, totalY);
    doc.text((totalGst / 2).toFixed(2), 180, totalY);
    totalY += 5;
    doc.text("Delivery Charges:", 130, totalY);
    doc.text(deliveryCharge.toFixed(2), 180, totalY);

    // Grand Total (Increased width)
    totalY += 10;
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text("Grand Total:", 130, totalY);
    doc.text(grandTotal.toFixed(2), 180, totalY);

    // Section 6: Amount in Words (Fixed to match Grand Total)
    currentY += 40;
    doc.setFontSize(12);
    doc.rect(10, currentY, 190, 10);  // Section 6 border (Increased width)
    const amountInWords = convertNumberToWords(grandTotal);  // Convert the Grand Total to words
    doc.text(`Amount in Words: ${amountInWords} Only`, 14, currentY + 7);

    // Section 7: Footer with Thank You and Signature
    currentY += 20;
    doc.rect(10, currentY, 190, 20);  // Section 7 border (Increased width)
    doc.setFontSize(10);
    doc.text("Thank you for your purchase!", 14, currentY + 7);
    doc.text("Please keep this invoice for your records.", 14, currentY + 12);

    // Authorized Signatory on the right
    doc.setFont('Helvetica', 'italic');
    doc.text("Authorized Signatory: Anmol Singh", 130, currentY + 12);

    // Save the PDF
    doc.save(`Invoice_${transactionId}.pdf`);
}

// Helper function to convert numbers to words (supports rupees and paise)
function convertNumberToWords(amount) {
    let words = "";
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    
    // Convert rupees to words
    words += `${numToWords(rupees)} Rupees`;
    
    // Convert paise to words if any
    if (paise > 0) {
        words += ` and ${numToWords(paise)} Paise`;
    }
    
    return words;
}

// Basic number-to-words converter for Indian numbering system (simplified)
function numToWords(num) {
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
        'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const c = ['Hundred', 'Thousand', 'Lakh', 'Crore'];
    
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
    
    return num; // Simplified for demonstration; extend for higher numbers if needed
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
