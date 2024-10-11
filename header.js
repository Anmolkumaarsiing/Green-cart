import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCZQVEtuO3A66jf-ZzLMqM_OubWm20aWHw",
    authDomain: "globeway-login-signup.firebaseapp.com",
    projectId: "globeway-login-signup",
    storageBucket: "globeway-login-signup.appspot.com",
    messagingSenderId: "351033593285",
    appId: "1:351033593285:web:8f5c42fd9d91415a32cfac",
    measurementId: "G-P3PC2K9GQ0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '/login/login.html'; // Redirect to login page
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
});
