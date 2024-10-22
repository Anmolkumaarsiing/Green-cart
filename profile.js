import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrSBQoJDG9Cn5t2vsWNvDDkDQJm1UxTgk",
  authDomain: "green--cart.firebaseapp.com",
  databaseURL: "https://green--cart-default-rtdb.firebaseio.com",
  projectId: "green--cart",
  storageBucket: "green--cart.appspot.com",
  messagingSenderId: "997863065",
  appId: "1:997863065:web:1716dad07cdbe649e81208",
  measurementId: "G-56BY927ZLY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Get references to the buttons
const editButton = document.querySelector(".edit-btn");
const saveButton = document.querySelector(".save-btn");
const cancelButton = document.querySelector(".cancel-btn");
const logoutButton = document.querySelector(".logout-btn");
const imageUpload = document.getElementById("image-upload");

// Function to handle logout
function handleLogout() {
  signOut(auth)
    .then(() => {
      console.log("User signed out successfully");
      localStorage.removeItem("loggedInUserId");
      window.location.href = "/login/login.html";
    })
    .catch((error) => {
      console.error("Error signing out: ", error);
    });
}

// Attach the logout function to the logout button
logoutButton.addEventListener("click", handleLogout);

// Get current logged-in user
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    loadUserData(userId);
    localStorage.setItem("loggedInUserId", userId);
  } else {
    const loggedInUserId = localStorage.getItem("loggedInUserId");
    if (loggedInUserId) {
      loadUserData(loggedInUserId);
    } else {
      window.location.href = "/login/login.html";
    }
  }
});

// Variable to store user data
let userData = {};

// Function to load user data from Firestore
async function loadUserData(userId) {
  try {
    const userRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      userData = docSnap.data();

      // Display the user data in the input fields
      
      document.getElementById("fullname-display").textContent = `${userData.firstname || 'First Name'} ${userData.lastname || 'Last Name'}`;
      document.getElementById("firstname-input").value = userData.firstname || "First Name";
      document.getElementById("lastname-input").value = userData.lastname || "Last Name";
      document.getElementById("email-input").value = userData.email || "Email";
      document.getElementById("phone-input").value = userData.phone || "Phone Number";
      document.getElementById("age-input").value = userData.age || "Age";
      document.getElementById("address-input").value = userData.address || "Address";

      // Update display (span) fields
      document.getElementById("firstname-display").textContent = userData.firstname || "John";
      document.getElementById("lastname-display").textContent = userData.lastname || "Doe";
      document.getElementById("email-display").textContent = userData.email || "john.doe@Greencart.com";
      document.getElementById("phone-display").textContent = userData.phone || "123-456-7890";
      document.getElementById("age-display").textContent = userData.age || "N/A";
      document.getElementById("address-display").textContent = userData.address || "123 Main St, Suite 100, Springfield, 54321";

      // Optional: set profile image if available
      if (userData.profileImage) {
        document.getElementById("profile-image").src = userData.profileImage;
      }
    } else {
      console.log("No such document in Firestore! Please update your profile.");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
}

// Function to format phone numbers
function formatPhoneNumber(phoneNumber) {
  if (phoneNumber) {
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  } else {
    return "";
  }
}

// Save changes to Firestore
async function saveChanges() {
  const userId = auth.currentUser.uid;
  const userRef = doc(firestore, "users", userId);

  const updatedData = {
    firstname: document.getElementById("firstname-input").value,
    lastname: document.getElementById("lastname-input").value,
    email: document.getElementById("email-input").value,
    phone: document.getElementById("phone-input").value,
    age: document.getElementById("age-input").value,
    address: document.getElementById("address-input").value,
  };

  const imageInput = document.getElementById("image-upload");
  if (imageInput.files && imageInput.files[0]) {
    const file = imageInput.files[0];
    const storagePath = `profile-images/${userId}/${file.name}`;
    const storageRef = ref(storage, storagePath);

    try {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optional: Track upload progress
        },
        (error) => {
          console.error("Error uploading image: ", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          updatedData.profileImage = downloadURL;

          // Update Firestore with all updated data
          await updateDoc(userRef, updatedData);
          console.log("User data successfully updated!");

          // Update the UI after saving
          updateDisplayFields(updatedData);
          toggleEditMode();
        }
      );
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  } else {
    try {
      await updateDoc(userRef, updatedData);
      console.log("User data successfully updated!");

      // Update the UI after saving
      updateDisplayFields(updatedData);
      toggleEditMode();
    } catch (error) {
      console.error("Error updating user data: ", error);
    }
  }
}

// Update the UI display fields
function updateDisplayFields(updatedData) {
  document.getElementById("firstname-display").textContent = updatedData.firstname;
  document.getElementById("lastname-display").textContent = updatedData.lastname;
  document.getElementById("email-display").textContent = updatedData.email;
  document.getElementById("phone-display").textContent = formatPhoneNumber(updatedData.phone);
  document.getElementById("age-display").textContent = updatedData.age;
  document.getElementById("address-display").textContent = updatedData.address;

  if (updatedData.profileImage) {
    document.getElementById("profile-image").src = updatedData.profileImage;
  }
}

// Toggle between edit and view modes
let isEditMode = false;
function toggleEditMode() {
  isEditMode = !isEditMode;

  const fields = document.querySelectorAll(".profile-field");
  fields.forEach((field) => {
    field.classList.toggle("edit-mode", isEditMode);
  });

  editButton.style.display = isEditMode ? "none" : "block";
  saveButton.style.display = isEditMode ? "block" : "none";
  cancelButton.style.display = isEditMode ? "block" : "none";

  logoutButton.disabled = isEditMode;
  logoutButton.style.opacity = isEditMode ? 0.5 : 1;
  logoutButton.style.cursor = isEditMode ? "not-allowed" : "pointer";

  if (isEditMode) {
    document.getElementById("firstname-input").value = userData.firstname || "";
    document.getElementById("lastname-input").value = userData.lastname || "";
    document.getElementById("email-input").value = userData.email || "";
    document.getElementById("phone-input").value = userData.phone || "";
    document.getElementById("age-input").value = userData.age || "";
    document.getElementById("address-input").value = userData.address || "";
  }
}

// Event listeners for buttons
editButton.addEventListener("click", toggleEditMode);
saveButton.addEventListener("click", saveChanges);
cancelButton.addEventListener("click", toggleEditMode);

// Event listener for image upload preview
imageUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("profile-image").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});
