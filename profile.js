import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const firstNameInput = document.getElementById('loggedUserFName');
const lastNameInput = document.getElementById('loggedUserLName');
const emailInput = document.getElementById('loggedUserEmail');
const editButton = document.getElementById('edit');
const saveButton = document.getElementById('save');
const cancelButton = document.getElementById('cancel');
const messageDiv = document.getElementById('message');

// Fetch user details from Firestore
onAuthStateChanged(auth, (user) => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        console.log(user);
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    firstNameInput.value = userData.firstName;
                    lastNameInput.value = userData.lastName;
                    emailInput.value = userData.email;
                } else {
                    console.log("No document found matching ID");
                }
            })
            .catch((error) => {
                console.log("Error getting document:", error);
            });
    } else {
        console.log("User ID not found in local storage");
    }
});

// Enable editing when "Edit" is clicked
editButton.addEventListener('click', () => {
    toggleEditMode(true);
});

// Cancel editing
cancelButton.addEventListener('click', () => {
    toggleEditMode(false);
    messageDiv.classList.add('hidden'); // Hide any previous success message
});

// Save button logic to update user details in Firestore
saveButton.addEventListener('click', () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const updatedFirstName = firstNameInput.value;
    const updatedLastName = lastNameInput.value;
    const updatedEmail = emailInput.value;

    if (loggedInUserId) {
        const docRef = doc(db, "users", loggedInUserId);
        updateDoc(docRef, {
            firstName: updatedFirstName,
            lastName: updatedLastName,
            email: updatedEmail
        })
        .then(() => {
            messageDiv.innerText = "Details have been updated";
            messageDiv.classList.remove('hidden'); // Show success message
            toggleEditMode(false);
        })
        .catch((error) => {
            console.error("Error updating profile:", error);
        });
    }
});

// Toggle between edit and view modes
function toggleEditMode(isEditing) {
    firstNameInput.disabled = !isEditing;
    lastNameInput.disabled = !isEditing;
    emailInput.disabled = !isEditing;

    editButton.classList.toggle('hidden', isEditing);
    saveButton.classList.toggle('hidden', !isEditing);
    cancelButton.classList.toggle('hidden', !isEditing);
}

// Logout button logic
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});
