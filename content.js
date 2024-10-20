// Import necessary functions from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration
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
const db = getFirestore(app); // Initialize Firestore

// Function to create a dynamic section for grocery or scrap items
function dynamicSection(ob) {
    let boxDiv = document.createElement("div");
    boxDiv.id = "box";

    let boxLink = document.createElement("a");
    boxLink.href = "/contentDetails.html?" + ob.id;

    let imgTag = document.createElement("img");
    imgTag.src = ob.preview;

    let detailsDiv = document.createElement("div");
    detailsDiv.id = "details";

    let h3 = document.createElement("h3");
    let h3Text = document.createTextNode(ob.name);
    h3.appendChild(h3Text);

    let h4 = document.createElement("h4");
    let h4Text = document.createTextNode(ob.brand);
    h4.appendChild(h4Text);

    let h2 = document.createElement("h2");
    let h2Text = document.createTextNode("rs  " + ob.price);
    h2.appendChild(h2Text);

    boxDiv.appendChild(boxLink);
    boxLink.appendChild(imgTag);
    boxLink.appendChild(detailsDiv);
    detailsDiv.appendChild(h3);
    detailsDiv.appendChild(h4);
    detailsDiv.appendChild(h2);

    return boxDiv;
}

let containerGrocery = document.getElementById("containerGrocery");
let containerScrap = document.getElementById("containerScrap");

// Fetch data from Firestore
const fetchDataFromFirestore = async () => {
    try {
        const productsCollection = collection(db, "products");
        const productSnapshot = await getDocs(productsCollection);
        
        // Log the fetched data
        const contentTitle = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        

        if (!contentTitle.length) {
            console.log("No data available"); // Log if no data is found
            return; // Exit if no data
        }

        if (document.cookie.indexOf(",counter=") >= 0) {
            let counter = document.cookie.split(",")[1].split("=")[1];
            document.getElementById("badge").innerHTML = counter;
        }

        contentTitle.forEach(item => {
            if (item.isScrap) {
                containerScrap.appendChild(dynamicSection(item));
            } else {
                containerGrocery.appendChild(dynamicSection(item));
            }
        });
    } catch (error) {
        console.log("Error fetching data: ", error);
    }
};

// Call the function to fetch data
fetchDataFromFirestore();
