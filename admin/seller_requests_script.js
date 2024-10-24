import { getFirestore, collection, getDocs, doc, updateDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

// Initialize Firebase (Replace with your actual config)
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
const sellerRequestsCollection = collection(db, 'seller_requests');

// Get references to HTML elements
const requestsTable = document
  .getElementById('requestsTable')
  .getElementsByTagName('tbody')[0];
const requestSearch = document.getElementById('requestSearch');

// Function to fetch and display seller requests, excluding "Accepted" ones
async function displaySellerRequests() {
  try {
    requestsTable.innerHTML = ''; // Clear existing data
    const requestsSnapshot = await getDocs(sellerRequestsCollection);

    if (requestsSnapshot.empty) {
      console.log('No matching documents.');
      return;
    }

    requestsSnapshot.forEach((doc) => {
      const requestData = doc.data();
      
      // Exclude accepted requests from being displayed
      if (requestData.status === 'Accepted') return;

      
      const row = requestsTable.insertRow();

      // Create table cells and populate data
      addDataToCell(row, requestData.ownerName || 'N/A');
      addDataToCell(row, requestData.shopName || 'N/A');
      addDataToCell(row, requestData.category || 'N/A');
      addDataToCell(row, requestData.email || 'N/A');
      addDataToCell(row, requestData.contact || 'N/A');
      addDataToCell(row, (requestData.timings && requestData.timings.start && requestData.timings.end) 
        ? `${requestData.timings.start} - ${requestData.timings.end}` 
        : 'N/A');
      addDataToCell(row, requestData.address || 'N/A');
      addDataToCell(row, requestData.pincode || 'N/A');
      addDataToCell(row, requestData.status || 'Pending');

      // Add action buttons
      const actionsCell = row.insertCell();
      actionsCell.classList.add('actions-cell');

      if (requestData.status === 'Pending') {
        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Approve';
        acceptBtn.classList.add('accept-btn');
        acceptBtn.addEventListener('click', () =>
          approveSellerRequest(doc.id, requestData)
        );
        actionsCell.appendChild(acceptBtn);

        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.classList.add('reject-btn');
        rejectBtn.addEventListener('click', () =>
          updateRequestStatus(doc.id, 'Rejected')
        );
        actionsCell.appendChild(rejectBtn);
      } else {
        actionsCell.textContent = requestData.status;
      }
    });
  } catch (error) {
    console.error('Error fetching seller requests:', error);
  }
}

// Helper function to add data to a table cell
function addDataToCell(row, data) {
  const cell = row.insertCell();
  cell.textContent = data;
}

// Function to update request status
async function updateRequestStatus(requestId, newStatus) {
  try {
    const requestDocRef = doc(db, 'seller_requests', requestId);
    await updateDoc(requestDocRef, { status: newStatus });
    displaySellerRequests(); // Refresh the table after updating
  } catch (error) {
    console.error('Error updating request status: ', error);
    // Handle error (e.g., display an error message)
  }
}

// Function to approve the request and create a seller account
async function approveSellerRequest(requestId, requestData) {
  try {
    const sellerDocRef = doc(db, 'sellers', requestId); // Use the same request ID for seller doc
    const newSellerData = {
      ownerName: requestData.ownerName,
      shopName: requestData.shopName,
      category: requestData.category,
      email: requestData.email,
      contact: requestData.contact,
      timings: requestData.timings,
      address: requestData.address,
      pincode: requestData.pincode,
      password: '1234567890' // Set the default password
    };

    // Create new seller account in 'sellers' collection
    await setDoc(sellerDocRef, newSellerData);

    // Update the request status to 'Accepted'
    await updateRequestStatus(requestId, 'Accepted');
  } catch (error) {
    console.error('Error approving seller request: ', error);
    // Handle error (e.g., display an error message)
  }
}

// Event listener for search input
requestSearch.addEventListener('input', () => {
  const searchText = requestSearch.value.toLowerCase();
  const rows = requestsTable.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const rowData = rows[i].textContent.toLowerCase();
    if (rowData.includes(searchText)) {
      rows[i].style.display = ''; // Show matching rows
    } else {
      rows[i].style.display = 'none'; // Hide non-matching rows
    }
  }
});

// Initial display of seller requests
displaySellerRequests();
