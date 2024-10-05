import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
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

document.getElementById('forgot-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value;

    try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent successfully.');
        // Redirect to reset password page with email query parameter
        // window.location.href = `resetPassword.html?email=${encodeURIComponent(email)}`;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        alert('Error sending password reset email. Please try again.');
    }
});
