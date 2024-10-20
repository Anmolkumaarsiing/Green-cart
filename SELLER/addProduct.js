// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get the form and handle submit
document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get values from the form
    const id = document.getElementById("id").value;
    const name = document.getElementById("name").value;
    const preview = document.getElementById("preview").value;
    const photos = document.getElementById("photos").value.split(",").map(url => url.trim()); // Split and trim URLs
    const description = document.getElementById("description").value;
    const brand = document.getElementById("brand").value;
    const price = parseFloat(document.getElementById("price").value);
    const pincode = document.getElementById("pincode").value;
    const isScrap = document.getElementById("isScrap").value === "true"; // Convert to boolean

    // Check if a product with the same ID already exists
    const productDoc = doc(db, "products", id);
    const productSnapshot = await getDoc(productDoc);

    if (productSnapshot.exists()) {
        // If the product already exists, alert the user
        alert("A product with this ID already exists. Please use a unique ID.");
        return; // Exit the function
    }

    // Create a new product object
    const newProduct = {
        id,
        name,
        preview,
        photos,
        description,
        brand,
        price,
        pincode,
        isScrap,
        createdAt: new Date().toISOString() // Optional: Add timestamp
    };

    // Set the product in Firestore using the id as the document ID
    try {
        await setDoc(productDoc, newProduct); // Use the id as the document ID
        console.log("Product added with ID: ", id);
        alert("Product added successfully!");
        document.getElementById("productForm").reset(); // Reset the form after successful addition
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Error adding product: " + e.message);
    }
});
