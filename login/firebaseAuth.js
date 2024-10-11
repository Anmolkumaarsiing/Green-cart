// Import the necessary Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCrSBQoJDG9Cn5t2vsWNvDDkDQJm1UxTgk",
    authDomain: "green--cart.firebaseapp.com",
    projectId: "green--cart",
    storageBucket: "green--cart.appspot.com",
    messagingSenderId: "997863065",
    appId: "1:997863065:web:1716dad07cdbe649e81208",
    measurementId: "G-56BY927ZLY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(); // Get the authentication instance
const db = getFirestore(); // Get the Firestore instance

// Function to display messages
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    if (messageDiv) {
        messageDiv.style.display = "block";
        messageDiv.innerHTML = message;
        messageDiv.style.opacity = 1;
        setTimeout(() => {
            messageDiv.style.opacity = 0;
        }, 5000);
    }
}

// Event listener for sign-up button
const signUpButton = document.getElementById('submitSignUp');
if (signUpButton) {
    signUpButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('rPassword').value;
        const confirmPassword = document.getElementById('cPassword').value;
        const username = document.getElementById('Uname').value;

        // Check if passwords match
        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', 'sinUpMessage');
            return;
        }

        try {
            // Create a new user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store additional user data in Firestore
            const userData = {
                email: email,
                username: username
            };

            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, userData);

            showMessage('Account Created Successfully', 'sinUpMessage');
            // Redirect to sign-in or another page (adjust the URL as needed)
            window.location.href = '../home.html';
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                showMessage('Email Already Exists!', 'sinUpMessage');
            } else {
                showMessage('Error creating user: ' + error.message, 'sinUpMessage');
            }
            console.error("Error creating user:", error);
        }
    });
}

// Event listener for sign-in button
const signInButton = document.getElementById('submitSignIn');
if (signInButton) {
    signInButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;

        try {
            // Sign in the user
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            showMessage('Sign In Successful', 'sinInMessage');
            // Redirect to home or another page after successful sign-in
            window.location.href = '../home.html'; // Change this to your target page
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                showMessage('User Not Found!', 'sinInMessage');
            } else if (error.code === 'auth/wrong-password') {
                showMessage('Incorrect Password!', 'sinInMessage');
            } else {
                showMessage('Invalid username or password', 'sinInMessage');
            }
            console.error("Error signing in:", error);
        }
    });
}
