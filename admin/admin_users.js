// admin_users.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Ensure the admin is logged in; otherwise, redirect to the login page
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "admin_login.html"; // Redirect if not logged in
    }
});

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
    // Fetch total users count
    async function fetchTotalUsers() {
        const usersCollection = collection(db, "users"); // Adjust the collection name if needed
        const snapshot = await getDocs(usersCollection);
        const totalUsers = snapshot.size;
        document.getElementById("totalUsers").innerText = totalUsers;
    }

    // Call fetchTotalUsers on load
    fetchTotalUsers();

    // Search users functionality
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) { // Check if searchBtn is found
        searchBtn.addEventListener("click", async () => {
            const searchInput = document.getElementById("searchInput").value.toLowerCase().trim();
            const usersCollection = collection(db, "users");
            const q = query(usersCollection);
            const querySnapshot = await getDocs(q);
            const userTableBody = document.getElementById("userTableBody");
            userTableBody.innerHTML = ""; // Clear previous results

            let foundUsers = false; // Flag to track if any user is found

            querySnapshot.forEach(doc => {
                const user = doc.data();
                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                if (fullName.includes(searchInput) || user.email.toLowerCase().includes(searchInput)) {
                    foundUsers = true; // Set flag to true if a match is found
                    const row = userTableBody.insertRow();
                    row.innerHTML = `
                        <td>${userTableBody.rows.length + 1}</td>
                        <td>${fullName}</td>
                        <td>${user.email}</td>
                        <td><button class="btn btn-warning edit-btn" data-id="${doc.id}">Edit</button></td>
                    `;
                }
            });

            if (!foundUsers) {
                const row = userTableBody.insertRow();
                row.innerHTML = `
                    <td colspan="4" class="text-center">No users found</td>
                `;
            }
        });
    } else {
        console.error("Search button not found");
    }

    // Edit user functionality
    document.getElementById("userTable").addEventListener("click", async (e) => {
        if (e.target.classList.contains("edit-btn")) {
            const userId = e.target.getAttribute("data-id");
            const userRef = doc(db, "users", userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                document.getElementById("editName").value = `${userData.firstName} ${userData.lastName}`;
                document.getElementById("editEmail").value = userData.email;
                document.getElementById("edit-user-section").style.display = "block";
                document.getElementById("editUserForm").dataset.id = userId; // Store userId for saving
            } else {
                console.error("No such document!");
            }
        }
    });

    // Save changes in the edit form
    document.getElementById("editUserForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const userId = e.target.dataset.id; // Get userId from dataset
        const userRef = doc(db, "users", userId); // Adjust the collection name if needed

        await updateDoc(userRef, {
            firstName: document.getElementById("editName").value.split(" ")[0],
            lastName: document.getElementById("editName").value.split(" ")[1]
        });

        // Hide the edit section and refresh the table
        document.getElementById("edit-user-section").style.display = "none";
        fetchTotalUsers(); // Refresh the user count
    });

    // Cancel edit functionality
    document.getElementById("cancelEditButton").addEventListener("click", () => {
        document.getElementById("edit-user-section").style.display = "none";
    });

    // Logout functionality
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth).then(() => {
                window.location.href = "admin_login.html"; // Redirect to login page after logout
            }).catch((error) => {
                console.error("Error during sign out:", error);
            });
        });
    }
});
