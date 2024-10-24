// Import Firebase Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCrSBQoJDG9Cn5t2vsWNvDDkDQJm1UxTgk",
    authDomain: "green--cart.firebaseapp.com",
    databaseURL: "https://green--cart-default-rtdb.firebaseio.com",
    projectId: "green--cart",
    storageBucket: "green--cart.appspot.com",
    messagingSenderId: "997863065",
    appId: "1:997863065:web:1716dad07cdbe649e81208",
    measurementId: "G-56BY927ZLY"
};
  
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ordersCollection = collection(db, 'orders'); // Assuming 'orders' is your collection

// Get references to HTML elements
const ordersTable = document
    .getElementById('ordersTable')
    .getElementsByTagName('tbody')[0];
const orderSearch = document.getElementById('orderSearch');

// Function to fetch and display orders
async function displayOrders() {
  ordersTable.innerHTML = ''; // Clear existing data
  const ordersSnapshot = await getDocs(ordersCollection);

  ordersSnapshot.forEach((doc) => {
      const orderData = doc.data();
      const row = ordersTable.insertRow();

      // Add data to cells
      addDataToCell(row, orderData.orderId || 'N/A'); 
      addDataToCell(row, orderData.userId || 'N/A'); // Assuming you have a 'userId' field
      addDataToCell(row, orderData.sellerId || 'N/A'); // Assuming you have a 'sellerId' field

      // Correctly parse and format orderDate
      const orderDate = orderData.orderDate ? new Date(orderData.orderDate) : null;
      addDataToCell(row, orderDate ? orderDate.toLocaleDateString() : 'N/A');

      // Set total amount to 0 if not available
      addDataToCell(row, orderData.totalAmount !== undefined ? orderData.totalAmount : 0);

      // Add status to a separate cell
      const statusCell = row.insertCell();
      statusCell.textContent = orderData.status === 'Pending' ? 'Pending' : 'Paid';

      // Create actions cell and add the invoice button only
      const actionsCell = row.insertCell();
      actionsCell.classList.add('actions-cell');

      const invoiceBtn = document.createElement('button');
      invoiceBtn.textContent = 'Generate Invoice';
      invoiceBtn.classList.add('invoice-btn');
      invoiceBtn.addEventListener('click', () =>
          generateInvoicePDF(orderData.orderId, orderData.totalAmount)
      );
      actionsCell.appendChild(invoiceBtn);
  });
}


// Helper function to add data to a table cell
function addDataToCell(row, data) {
    const cell = row.insertCell();
    cell.textContent = data;
}

// Function to update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const orderDocRef = doc(db, 'orders', orderId);
        await updateDoc(orderDocRef, { status: newStatus });
        displayOrders(); // Refresh the table after updating
    } catch (error) {
        console.error('Error updating order status: ', error);
        // Handle error (e.g., display an error message)
    }
}

// Function to open a modal for viewing order details (placeholder)
function openOrderModal(orderId, orderData) {
    // You can implement modal display logic here
    alert(`Order ID: ${orderId}\nDetails: ${JSON.stringify(orderData, null, 2)}`);
}

// Event listener for search input
orderSearch.addEventListener('input', () => {
    const searchText = orderSearch.value.toLowerCase();
    const rows = ordersTable.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i].textContent.toLowerCase();
        if (rowData.includes(searchText)) {
            rows[i].style.display = ''; // Show matching rows
        } else {
            rows[i].style.display = 'none'; // Hide non-matching rows
        }
    }
});

// Function to generate PDF invoice
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
    let currentY = 60 + gap; // Adding height of Section 2 and the gap

    // Section 3: Bill of and Payment Details
    doc.setFontSize(12);
    doc.rect(10, currentY, 190, 35);  // Section 3 border (Increased width)
    doc.setFont('Helvetica', 'bold');
    doc.text("Bill of:", 14, currentY + 10);  // Adjust text position within the new Y
    doc.setFont('Helvetica', 'normal');
    doc.text("Grocery items from Green Cart", 14, currentY + 15);  // Adjust text position within the new Y
    doc.text("Transaction Id: " + transactionId, 14, currentY + 25);
    
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
    doc.text("Price", 160, currentY + 6);
    currentY += 10;

    // Populate Items
    items.forEach((item) => {
        doc.setTextColor(0, 0, 0);  // Black text for body
        doc.text(item.description, 14, currentY);  // Description
        doc.text(item.serialNo.toString(), 80, currentY);  // Serial No
        doc.text(item.quantity.toString(), 110, currentY);  // Quantity
        doc.text(item.price.toString(), 160, currentY);  // Price
        currentY += 6; // Move to the next row
    });

    // Move down for totals
    currentY += 10;

    // Section 5: Totals
    doc.setFontSize(12);
    doc.setFillColor(100, 150, 255);  // Light blue for totals section
    doc.rect(10, currentY, 190, 30, 'F');  // Section 5 border (Increased width)
    doc.setTextColor(255, 255, 255);  // White text for totals
    doc.text("Subtotal: " + subtotal.toFixed(2), 14, currentY + 10);
    doc.text("GST: " + totalGst.toFixed(2), 14, currentY + 15);
    doc.text("Delivery Charge: " + deliveryCharge.toFixed(2), 14, currentY + 20);
    doc.text("Grand Total: " + grandTotal.toFixed(2), 14, currentY + 25);
    
    // Final save
    doc.save('invoice_' + transactionId + '.pdf');
}

// Helper function to get item details from cookies (Assuming this function is defined elsewhere)
function getItemDetailsFromCookies() {
    // Placeholder for your actual implementation of retrieving items from cookies
    return [
        { description: 'Item 1', serialNo: 1, quantity: 2, price: 100 },
        { description: 'Item 2', serialNo: 2, quantity: 1, price: 150 },
        // Add more items as necessary
    ];
}

// Load orders on page load
document.addEventListener('DOMContentLoaded', displayOrders);
