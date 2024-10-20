// seller-register.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", function() {
    // Initialize Flatpickr for time selection
    flatpickr("#start-time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true
    });

    flatpickr("#end-time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true
    });

    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const shopName = document.getElementById("shopname").value;
        const ownerName = document.getElementById("owner").value;
        const address = document.getElementById("address").value;
        const startTime = document.getElementById("start-time").value;
        const endTime = document.getElementById("end-time").value;
        const contact = document.getElementById("contact").value;
        const email = document.getElementById("E-Mail").value;
        const category = document.getElementById("category").value;
        const pincode = document.getElementById("pincode").value;

        try {
            await addDoc(collection(db, "seller_requests"), {
                shopName,
                ownerName,
                address,
                timings: {
                    start: startTime,
                    end: endTime
                },
                contact,
                email,
                category,
                pincode
            });
            // After successful submission, redirect to confirmation page
            window.location.href = "confirmation.html";  
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error registering seller. Please try again.");
        }
    });
});
