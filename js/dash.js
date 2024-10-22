// Import Firebase functions
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Check if the user is already logged in
const loggedInUserId = localStorage.getItem('loggedInUserId');
console.log("Logged In User ID:", loggedInUserId); // Debugging log

if (!loggedInUserId) {
    console.log("No user is logged in, redirecting to login.html");
    window.location.href = '/login/login.html'; // Redirect to login page if not logged in
} else {
    console.log("User is logged in, proceeding to dashboard.");
          window.location.href = '../homepage.html';
}

//----------------------DashNavigation--------------------
document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll("nav a");
    
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop;
                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth"
                });
            }
        });
    });
});

// Mobile menu functionality
var navLnks = document.getElementById("navLnks");
function showMenu() {
    navLnks.style.right = "0";
}
function hideMenu() {
    navLnks.style.right = "-200px";
}

// Optional: Add logout functionality
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('loggedInUserId'); // Remove user ID from localStorage
        auth.signOut().then(() => {
            console.log("User logged out successfully.");
            window.location.href = 'login.html'; // Redirect to login page after logout
        }).catch((error) => {
            console.error('Logout error:', error);
        });
    });
}
