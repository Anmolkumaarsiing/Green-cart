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
                // Generate invoice PDF after posting transaction data
                const orderId = JSON.parse(this.responseText).orderId || generateOrderId();
                generateInvoicePDF(orderId, amount);
                // Redirect to order placed page after successfully posting transaction data
                window.location.href = "/orderPlaced.html";
            } else {
                console.error("Failed to post transaction data:", this.responseText);
            }
        }
    };

    // Get current date in IST format
    const createdAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Send only the necessary fields as JSON string
    let cleanOrderData = {
        transactionId: transactionId,
        amount: amount,
        createdAt: createdAt,
        orderId: transactionId // Assuming transactionId is used as Order ID
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

// Function to generate PDF invoice
function generateInvoicePDF(transactionId, amount) {
    // Fetch item details from cookies
    getItemDetailsFromCookies().then(items => {
        if (!items || items.length === 0) {
            console.error("No items found for the invoice.");
            return; // Exit if no items are found
        }

        // Access jsPDF and autoTable
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.autoTable = window.jspdf.autoTable; // Ensure autoTable is correctly referenced

        // Set the title and other header information
        doc.setFontSize(18);
        doc.text("TAX INVOICE", 10, 10);
        doc.setFontSize(12);
        doc.text(`GREEN CART`, 10, 20);
        doc.text(`Parul university, Vadodara, Gujarat, 391025`, 10, 25);
        doc.text(`Email ID: anmolkumaarsiingh@gmail.com`, 10, 30);
        doc.text(`DATE: ${new Date().toLocaleDateString("en-IN")}`, 10, 35);
        doc.text(`Order ID: ${transactionId}`, 10, 40);

        doc.text("Bill of: Grocery items from Green cart", 10, 50);
        doc.text("Payment Date: " + new Date().toLocaleDateString("en-IN"), 10, 55);
        doc.text("Payment Mode: Razorpay", 10, 60);
        doc.text("Description", 10, 70);

        // Add table headers
        const headers = [["S.No", "Product Name", "Qty", "Price", "Amount"]];
        const data = items.map((item, index) => [
            index + 1,
            item.name,
            item.quantity,
            item.price.toFixed(2),
            (item.price * item.quantity).toFixed(2)
        ]);

        // Calculate totals
        const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const gst = totalAmount * 0.18;
        const deliveryCharge = Math.min(20, 0.10 * totalAmount);
        const grandTotal = totalAmount + gst + deliveryCharge;

        // Create the table in the PDF
        doc.autoTable({
            head: headers,
            body: data,
            startY: 80,
            theme: 'grid'
        });

        // Add total amounts
        doc.text(`Total: ₹ ${totalAmount.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 10);
        doc.text(`CGST (9%): ₹ ${(gst / 2).toFixed(2)}`, 10, doc.autoTable.previous.finalY + 15);
        doc.text(`SGST (9%): ₹ ${(gst / 2).toFixed(2)}`, 10, doc.autoTable.previous.finalY + 20);
        doc.text(`Delivery Charges: ₹ ${deliveryCharge.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 25);
        doc.text(`Grand Total: ₹ ${grandTotal.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 30);
        doc.text(`Terms & Conditions: No returns, no refunds.`, 10, doc.autoTable.previous.finalY + 35);
        doc.text(`Signature: ______________`, 10, doc.autoTable.previous.finalY + 40);

        // Save the PDF
        doc.save(`Invoice_${transactionId}.pdf`);
    }).catch(error => {
        console.error("Error fetching item details:", error);
    });
}

// Function to fetch item details from cookies (update this according to your actual implementation)
function getItemDetailsFromCookies() {
    return new Promise((resolve, reject) => {
        try {
            const items = []; // Replace this with your actual code to get items
            // Example of item structure
            // items.push({ name: "Potato", quantity: 1, price: 30 });
            // items.push({ name: "Carrot", quantity: 1, price: 20 });

            // Assuming you have a method to parse your cookies
            const cookieData = document.cookie.split('; ').find(row => row.startsWith('items='));
            if (cookieData) {
                const jsonData = decodeURIComponent(cookieData.split('=')[1]);
                const parsedItems = JSON.parse(jsonData);
                parsedItems.forEach(item => {
                    items.push({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    });
                });
            }

            resolve(items);
        } catch (error) {
            reject(error);
        }
    });
}

// Assuming you have a method to initialize cart items from cookies
function initializeCartItems() {
    const items = getItemDetailsFromCookies();
    items.then(itemList => {
        let totalAmount = 0;
        itemList.forEach(item => {
            dynamicCartSection(item, item.quantity);
            totalAmount += item.price * item.quantity; // Update total amount for the invoice
        });
        amountUpdate(totalAmount);
    });
}

// Call this function to initialize the cart items when the page loads
initializeCartItems();
