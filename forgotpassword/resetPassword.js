// import { getAuth, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";

// // Initialize Firebase
// const firebaseConfig = {
//     apiKey: "AIzaSyCZQVEtuO3A66jf-ZzLMqM_OubWm20aWHw",
//     authDomain: "globeway-login-signup.firebaseapp.com",
//     projectId: "globeway-login-signup",
//     storageBucket: "globeway-login-signup.appspot.com",
//     messagingSenderId: "351033593285",
//     appId: "1:351033593285:web:8f5c42fd9d91415a32cfac",
//     measurementId: "G-P3PC2K9GQ0"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// // Extract query parameters
// const urlParams = new URLSearchParams(window.location.search);
// const oobCode = urlParams.get('oobCode');

// document.getElementById('reset-password-form').addEventListener('submit', async (event) => {
//     event.preventDefault();

//     const newPassword = document.getElementById('new-password').value;
//     const confirmPassword = document.getElementById('confirm-password').value;

//     if (newPassword !== confirmPassword) {
//         alert('Passwords do not match.');
//         return;
//     }

//     try {
//         await confirmPasswordReset(auth, oobCode, newPassword);
//         alert('Password has been reset successfully.');
//         window.location.href = '../login/login.html';
//     } catch (error) {
//         console.error('Error resetting password:', error);
//         alert('Error resetting password. Please try again.');
//     }
// });
