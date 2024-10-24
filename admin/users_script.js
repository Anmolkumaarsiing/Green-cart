import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
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
const usersCollection = collection(db, 'users');

// Get references to HTML elements
const usersTable = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
const userSearch = document.getElementById('userSearch');
const addUserBtn = document.getElementById('addUserBtn');
const userModal = document.getElementById('userModal');
const closeModalBtn = document.querySelector('.close-modal');
const userForm = document.getElementById('userForm');
const userIdInput = document.getElementById('userId');
let usersData = []; // Store fetched users
let editMode = false;

// Function to fetch and display users
async function displayUsers(filteredUsers = null) {
    usersTable.innerHTML = ''; // Clear existing data
    const usersToDisplay = filteredUsers || usersData;

    usersToDisplay.forEach((userDoc) => {
        const userData = userDoc.data();
        const row = usersTable.insertRow();
        const firstNameCell = row.insertCell();
        const lastNameCell = row.insertCell();
        const emailCell = row.insertCell();
        const ageCell = row.insertCell();
        const phoneCell = row.insertCell();
        const addressCell = row.insertCell();
        const actionsCell = row.insertCell();

        firstNameCell.textContent = userData.firstName || 'N/A';
        lastNameCell.textContent = userData.lastName || 'N/A';
        emailCell.textContent = userData.email || 'N/A';
        ageCell.textContent = userData.age || 'N/A';
        phoneCell.textContent = userData.phone || 'N/A';
        addressCell.textContent = userData.address || 'N/A';

        // Add action buttons
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn'); // Add the class "edit-btn"
        editBtn.addEventListener('click', () => openUserModal(userDoc.id, userData));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn'); // Add the class "delete-btn"
        deleteBtn.addEventListener('click', () => deleteUser(userDoc.id));

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
    });
}

// Function to fetch users from Firestore and store them
async function fetchUsers() {
    const usersSnapshot = await getDocs(usersCollection);
    usersData = usersSnapshot.docs;
    displayUsers();
}

// Function to open the user modal
function openUserModal(userId = null, userData = {}) {
    if (userId) {
        editMode = true;
        userIdInput.value = userId;
        document.getElementById('firstName').value = userData.firstName || '';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('age').value = userData.age || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('address').value = userData.address || '';
    } else {
        editMode = false;
        userForm.reset();
    }
    userModal.style.display = 'block';
}

// Function to close the user modal
function closeUserModal() {
    userModal.style.display = 'none';
}

// Function to add or edit a user
async function saveUser(event) {
    event.preventDefault();
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        age: document.getElementById('age').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
    };

    if (editMode) {
        // Edit user
        const userId = userIdInput.value;
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, userData);
    } else {
        // Add user
        await addDoc(collection(db, 'users'), userData);
    }

    closeUserModal();
    fetchUsers();
}

// Function to delete a user
async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        await deleteDoc(doc(db, 'users', userId));
        fetchUsers();
    }
}

// Function to filter users by search input
function filterUsers() {
    const searchTerm = userSearch.value.toLowerCase();
    const filteredUsers = usersData.filter((doc) => {
        const userData = doc.data();
        const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();
        return (
            fullName.includes(searchTerm) ||
            userData.email?.toLowerCase().includes(searchTerm) ||
            userData.phone?.toLowerCase().includes(searchTerm) ||
            userData.address?.toLowerCase().includes(searchTerm)
        );
    });
    displayUsers(filteredUsers);
}

// Event listeners
userSearch.addEventListener('input', filterUsers);
addUserBtn.addEventListener('click', () => openUserModal());
closeModalBtn.addEventListener('click', closeUserModal);
userForm.addEventListener('submit', saveUser);

// Initial fetch and display of users
fetchUsers();
