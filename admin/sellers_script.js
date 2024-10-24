// Import required Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
const sellersCollection = collection(db, 'sellers');

// Get references to HTML elements
const sellersTable = document.getElementById('sellersTable').getElementsByTagName('tbody')[0];
const sellerSearch = document.getElementById('sellerSearch');
const modal = document.getElementById('sellerModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveChangesBtn = document.getElementById('saveChangesBtn');

// Input fields
const shopNameElem = document.getElementById('shopName');
const ownerNameElem = document.getElementById('ownerName');
const categoryElem = document.getElementById('category');
const emailElem = document.getElementById('email');
const contactElem = document.getElementById('contact');
const addressElem = document.getElementById('address');
const pincodeElem = document.getElementById('pincode');

let currentSellerId = '';

// Function to fetch and display sellers
async function displaySellers() {
    sellersTable.innerHTML = ''; // Clear existing data
    const sellersSnapshot = await getDocs(sellersCollection);

    sellersSnapshot.forEach((doc) => {
        const sellerData = doc.data();
        const row = sellersTable.insertRow();

        addDataToCell(row, sellerData.shopName || 'N/A');
        addDataToCell(row, sellerData.ownerName || 'N/A');
        addDataToCell(row, sellerData.category || 'N/A');
        addDataToCell(row, sellerData.email || 'N/A');
        addDataToCell(row, sellerData.contact || 'N/A');
        addDataToCell(row, sellerData.address || 'N/A');
        addDataToCell(row, sellerData.pincode || 'N/A');

        // Add action buttons
        const actionsCell = row.insertCell();
        actionsCell.classList.add('actions-cell');

        const viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.textContent = 'View Details';
        viewDetailsBtn.classList.add('view-details-btn');
        viewDetailsBtn.addEventListener('click', () => openSellerModal('view', sellerData, doc.id));
        actionsCell.appendChild(viewDetailsBtn);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => openSellerModal('edit', sellerData, doc.id));
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => confirmAndDeleteSeller(doc.id));
        actionsCell.appendChild(deleteBtn);
    });
}

// Helper function to add data to a table cell
function addDataToCell(row, data) {
    const cell = row.insertCell();
    cell.textContent = data;
}

// Function to open the modal and populate data
function openSellerModal(action, sellerData, sellerId) {
    currentSellerId = sellerId; // Store the seller ID for saving
    shopNameElem.value = sellerData.shopName || ''; // Use value for input fields
    ownerNameElem.value = sellerData.ownerName || '';
    categoryElem.value = sellerData.category || '';
    emailElem.value = sellerData.email || '';
    contactElem.value = sellerData.contact || '';
    addressElem.value = sellerData.address || '';
    pincodeElem.value = sellerData.pincode || '';

    if (action === 'view') {
        saveChangesBtn.style.display = 'none'; // Hide save button when viewing
        disableInputs(true); // Disable inputs when viewing
    } else if (action === 'edit') {
        saveChangesBtn.style.display = 'block'; // Show save button when editing
        disableInputs(false); // Enable inputs when editing
    }

    modal.style.display = 'block'; // Show the modal
}

// Function to disable or enable input fields
function disableInputs(disable) {
    shopNameElem.disabled = disable;
    ownerNameElem.disabled = disable;
    categoryElem.disabled = disable;
    emailElem.disabled = disable;
    contactElem.disabled = disable;
    addressElem.disabled = disable;
    pincodeElem.disabled = disable;
}

// Function to save changes
saveChangesBtn.addEventListener('click', async () => {
    // Basic form validation
    if (!shopNameElem.value || !ownerNameElem.value || !emailElem.value) {
        alert('Please fill in all required fields (Shop Name, Owner Name, Email).');
        return;
    }

    const updatedData = {
        shopName: shopNameElem.value,
        ownerName: ownerNameElem.value,
        category: categoryElem.value,
        email: emailElem.value,
        contact: contactElem.value,
        address: addressElem.value,
        pincode: pincodeElem.value
    };

    try {
        await updateDoc(doc(db, 'sellers', currentSellerId), updatedData); // Update Firestore
        alert('Seller details updated successfully');
        modal.style.display = 'none'; // Close the modal
        displaySellers(); // Refresh the seller list
    } catch (error) {
        console.error('Error updating seller:', error);
        alert('Failed to update seller details. Please try again later.');
    }
});

// Function to confirm and delete seller
async function confirmAndDeleteSeller(sellerId) {
    if (confirm('Are you sure you want to delete this seller?')) {
        try {
            await deleteDoc(doc(db, 'sellers', sellerId));
            alert('Seller deleted successfully');
            displaySellers(); // Refresh the seller list
        } catch (error) {
            console.error('Error deleting seller:', error);
            alert('Failed to delete seller. Please try again later.');
        }
    }
}

// Close modal when clicking the close button
closeModalBtn.onclick = () => {
    modal.style.display = 'none'; // Hide the modal
    clearModalInputs(); // Clear inputs when modal closes
};

// Close modal when clicking outside of the modal
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'; // Hide the modal
        clearModalInputs(); // Clear inputs when modal closes
    }
};

// Function to clear modal inputs
function clearModalInputs() {
    shopNameElem.value = '';
    ownerNameElem.value = '';
    categoryElem.value = '';
    emailElem.value = '';
    contactElem.value = '';
    addressElem.value = '';
    pincodeElem.value = '';
}

// Function to filter sellers based on search input
sellerSearch.addEventListener('input', () => {
    const searchTerm = sellerSearch.value.toLowerCase();
    const rows = sellersTable.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const cells = row.getElementsByTagName('td');
        const rowData = Array.from(cells).map(cell => cell.textContent.toLowerCase());
        const isVisible = rowData.some(data => data.includes(searchTerm));
        row.style.display = isVisible ? '' : 'none'; // Show or hide row
    });
});

// Fetch sellers when the page loads
displaySellers();
