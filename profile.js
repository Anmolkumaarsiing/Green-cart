import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Get references to the buttons
const editButton = document.querySelector('.edit-btn');
const saveButton = document.querySelector('.save-btn');
const cancelButton = document.querySelector('.cancel-btn');
const logoutButton = document.querySelector('.logout-btn');

// Function to handle logout
function handleLogout() {
  signOut(auth)
    .then(() => {
      console.log("User signed out successfully");
      localStorage.removeItem('loggedInUserId');
      window.location.href = "/login/login.html";
    })
    .catch((error) => {
      console.error("Error signing out: ", error);
    });
}

// Attach the logout function to the logout button
logoutButton.addEventListener('click', handleLogout);

// Get current logged-in user
auth.onAuthStateChanged(function(user) {
  if (user) {
    const userId = user.uid;
    loadUserData(userId); 
    localStorage.setItem('loggedInUserId', userId); // Store user ID in local storage
  } else {
    // If not logged in, check if a user ID is stored locally
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      // If a user ID exists, assume the user is logged in and load data
      loadUserData(loggedInUserId);
    } else {
      // If no user ID, redirect to the login page
      window.location.href = "login.html";
    }
  }
});

// Variable to store user data
let userData = {}; // Initialize as an empty object

// Load user data from Firestore
async function loadUserData(userId) {
  const userRef = doc(firestore, 'users', userId);
  const docSnap = await getDoc(userRef);

  
  if (docSnap.exists()) {
    userData = docSnap.data(); // Store the fetched data

    // Update the display fields
    document.getElementById('name-display').textContent = userData.name;
    document.getElementById('email-display').textContent = userData.email;

    document.getElementById('email-display').textContent = userData.email;
    document.getElementById('email-input').value = userData.email;

    document.getElementById('phone-display').textContent = userData.phone;
    document.getElementById('phone-input').value = userData.phone;

    document.getElementById('age-display').textContent = userData.age;
    document.getElementById('age-input').value = userData.age;

    document.getElementById('address-display').textContent = userData.address;
    document.getElementById('address-input').value = userData.address;

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

  const imageInput = document.getElementById('image-upload');
  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const profileImageUrl = e.target.result;
      updatedData.profileImage = profileImageUrl; 
      document.getElementById('profile-image').src = profileImageUrl;

      try {
        await updateDoc(userRef, updatedData); 
        console.log("User data successfully updated!");
        toggleEditMode(); 
      } catch (error) {
        console.error("Error updating user data: ", error);
      }
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    try {
      await updateDoc(userRef, updatedData);
      console.log("User data successfully updated!");
      toggleEditMode(); 
    } catch (error) {
      console.error("Error updating user data: ", error);
    }
  }

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

  editButton.style.display = isEditMode ? 'none' : 'block';
  saveButton.style.display = isEditMode ? 'block' : 'none';
  cancelButton.style.display = isEditMode ? 'block' : 'none';

  // Disable/Enable Logout button based on edit mode
  logoutButton.disabled = isEditMode;
  if (isEditMode) {
    logoutButton.style.opacity = 0.5;
    logoutButton.style.cursor = "not-allowed";
    // Update input fields with data from the display fields
    document.getElementById('name-input').value = userData.name;
    document.getElementById('email-input').value = userData.email;
  } else {
    logoutButton.style.opacity = 1;
    logoutButton.style.cursor = "pointer";
  }
}

// Event listeners for buttons
editButton.addEventListener('click', toggleEditMode);
saveButton.addEventListener('click', saveChanges);
cancelButton.addEventListener('click', toggleEditMode);

// Event listener for image upload
document.getElementById('image-upload').addEventListener('change', function() {
  saveChanges();
});

// Expose functions globally (optional, for debugging)
window.toggleEditMode = toggleEditMode;
window.saveChanges = saveChanges;
