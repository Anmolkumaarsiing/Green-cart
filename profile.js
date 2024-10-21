import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your Firebase configuration
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
const firestore = getFirestore(app);
const auth = getAuth(app);

// Get current logged-in user
auth.onAuthStateChanged(function(user) {
    if (user) {
        const userId = user.uid;
        loadUserData(userId);
    } else {
        // Redirect to login if not logged in
        window.location.href = "login.html";
    }
});

// Load user data from Firestore
async function loadUserData(userId) {
    const userRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        // Display real name in h2
        document.getElementById('name-display').textContent = userData.name;
        // Set real name in input field
        document.getElementById('name-input').value = userData.name;

        document.getElementById('email-display').textContent = userData.email;
        document.getElementById('email-input').value = userData.email;
        document.getElementById('phone-display').textContent = userData.phone;
        document.getElementById('phone-input').value = userData.phone;
        document.getElementById('age-display').textContent = userData.age;
        document.getElementById('age-input').value = userData.age;
        document.getElementById('address-display').textContent = userData.address;
        document.getElementById('address-input').value = userData.address;

        // Set profile image
        if (userData.profileImage) {
            document.getElementById('profile-image').src = userData.profileImage;
        }
    } else {
        console.log("No user data found!");
    }
}


// Save changes to Firestore
async function saveChanges() {
    const userId = auth.currentUser.uid;
    const userRef = doc(firestore, 'users', userId);

    const updatedData = {
        name: document.getElementById('name-input').value,
        email: document.getElementById('email-input').value,
        phone: document.getElementById('phone-input').value,
        age: document.getElementById('age-input').value,
        address: document.getElementById('address-input').value
    };

    // Update profile image if a new one is selected
    const imageInput = document.getElementById('image-upload');
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            const profileImageUrl = e.target.result;
            updatedData.profileImage = profileImageUrl; // Save image URL to Firestore
            document.getElementById('profile-image').src = profileImageUrl;

            try {
                await updateDoc(userRef, updatedData); // Update document in Firestore
                console.log("User data successfully updated!");
                toggleEditMode(); // Exit edit mode after saving
            } catch (error) {
                console.error("Error updating user data: ", error);
            }
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        // If no new image, update Firestore without changing the profileImage
        try {
            await updateDoc(userRef, updatedData); // Update document in Firestore
            console.log("User data successfully updated!");
            toggleEditMode(); // Exit edit mode after saving
        } catch (error) {
            console.error("Error updating user data: ", error);
        }
    }

    // Update displayed fields without waiting for image loading
    document.getElementById('name-display').textContent = updatedData.name;
    document.getElementById('email-display').textContent = updatedData.email;
    document.getElementById('phone-display').textContent = updatedData.phone;
    document.getElementById('age-display').textContent = updatedData.age;
    document.getElementById('address-display').textContent = updatedData.address;
}

// Toggle between edit and view modes
let isEditMode = false;

function toggleEditMode() {
    isEditMode = !isEditMode;
    const fields = document.querySelectorAll('.profile-field');
    fields.forEach(field => {
        field.classList.toggle('edit-mode', isEditMode);
    });

    document.querySelector('.edit-btn').style.display = isEditMode ? 'none' : 'block';
    document.querySelector('.save-btn').style.display = isEditMode ? 'block' : 'none';
    document.querySelector('.cancel-btn').style.display = isEditMode ? 'block' : 'none';
}

// Event listeners for buttons
document.querySelector('.edit-btn').addEventListener('click', toggleEditMode);
document.querySelector('.save-btn').addEventListener('click', saveChanges);
document.querySelector('.cancel-btn').addEventListener('click', toggleEditMode);


// Event listener for image upload
document.getElementById('image-upload').addEventListener('change', function() {
    saveChanges();
});
// At the end of profile.js
window.toggleEditMode = toggleEditMode;
window.saveChanges = saveChanges;
