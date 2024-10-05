// // Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
// import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCZQVEtuO3A66jf-ZzLMqM_OubWm20aWHw",
//   authDomain: "globeway-login-signup.firebaseapp.com",
//   projectId: "globeway-login-signup",
//   storageBucket: "globeway-login-signup.appspot.com",
//   messagingSenderId: "351033593285",
//   appId: "1:351033593285:web:8f5c42fd9d91415a32cfac",
//   measurementId: "G-P3PC2K9GQ0"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


// function showMessage(message,divId){
//     var messageDiv = document.getElementById(divId);
//     messageDiv.style.display = "block";
//     messageDiv.innerHTML = message;
//     messageDiv.style.opacity = 1;
//     setTimeout(function(){
//         messageDiv.style.opacity = 0;
//     },5000);
// }


// const signUp = document.getElementById('submitSignUp');
// signUp.addEventListener('click' , (event)=>{
//     event.preventDefault();
//     console.log('Sign-up button clicked!');
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('rPassword').value;
//     const confirmPassword = document.getElementById('cPassword').value;

//     const name = document.getElementById('Uname').value;

//     const auth = getAuth();
//     const db = getFirestore();

//     createUserWithEmailAndPassword(auth,email, password)
//     .then((userCredential) => {
//         const user = userCredential.user;
//         const userData = {
//             email: email,
//             username : name
//         };
//         showMessage('Account Created Successfully','signUpMessage');
//         const docRef = doc(db,"users", user.uid);
//         setDoc(docRef,userData)
//         .then(()=>{
//             window.location.href = 'login.html';
//         })
//         .catch((error)=>{
//             console.error("error writing document", error);

//         });
//     })
//     .catch((error) => {
//         const errorCode = error.code;
//         if(errorCode == 'auth/email-already-in-use'){
//             showMessage('Email Already Exists !!!','signUpMessage');
//         }
//         else{
//             showMessage('Unable to create User !!!','signUpMessage');
//         }
//     });
// });



// // Import the necessary Firebase SDK modules
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
// import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";



// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyCZQVEtuO3A66jf-ZzLMqM_OubWm20aWHw",
//     authDomain: "globeway-login-signup.firebaseapp.com",
//     projectId: "globeway-login-signup",
//     storageBucket: "globeway-login-signup.appspot.com",
//     messagingSenderId: "351033593285",
//     appId: "1:351033593285:web:8f5c42fd9d91415a32cfac",
//     measurementId: "G-P3PC2K9GQ0"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth();
// const db = getFirestore();

// // Function to display messages
// function showMessage(message, divId) {
//     const messageDiv = document.getElementById(divId);
//     messageDiv.style.display = "block";
//     messageDiv.innerHTML = message;
//     messageDiv.style.opacity = 1;
//     setTimeout(() => {
//         messageDiv.style.opacity = 0;
//         setTimeout(() => {
//             messageDiv.style.display = "none";
//         }, 1000); // Hide after fading out
//     }, 5000); // Display duration
// }

// // Ensure the DOM is fully loaded before accessing elements
// document.addEventListener("DOMContentLoaded", () => {
//     // Event listener for sign-up button
//     const signUpButton = document.getElementById('submitSignUp');
//     if(signUpButton){
//         signUpButton.addEventListener('click', async (event) => {
//             event.preventDefault();
    
//             const email = document.getElementById('email').value;
//             const password = document.getElementById('rPassword').value;
//             const username = document.getElementById('Uname').value;
    
//             // Validate password match
//             const confirmPassword = document.getElementById('cPassword').value;
//             if (password !== confirmPassword) {
//                 showMessage('Passwords do not match!', 'sinUpMessage');
//                 return;
//             }
    
//             try {
//                 // Create a new user account
//                 const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//                 const user = userCredential.user;
    
//                 // Store additional user data in Firestore
//                 const userData = {
//                     email: email,
//                     username: username
//                 };
    
//                 const docRef = doc(db, "users", user.uid);
//                 await setDoc(docRef, userData);
    
//                 showMessage('Account Created Successfully', 'sinUpMessage');
//                 // Redirect to login page (adjust the URL as needed)
//                 window.location.href = 'login.html';
//             } catch (error) {
//                 console.error("Error creating user:", error);  // Add this for detailed logs
//                 if (error.code === 'auth/email-already-in-use') {
//                     showMessage('Email Already Exists!', 'sinUpMessage');
//                 } else if (error.code === 'auth/invalid-email') {
//                     showMessage('Invalid Email Format!', 'sinUpMessage');
//                 } else if (error.code === 'auth/weak-password') {
//                     showMessage('Password should be at least 6 characters!', 'sinUpMessage');
//                 } else {
//                     showMessage('Unable to create User!', 'sinUpMessage');
//                 }
//             }
            
//         });
//     }
// });







// Import the necessary Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCZQVEtuO3A66jf-ZzLMqM_OubWm20aWHw",
    authDomain: "globeway-login-signup.firebaseapp.com",
    projectId: "globeway-login-signup",
    storageBucket: "globeway-login-signup.appspot.com",
    messagingSenderId: "351033593285",
    appId: "1:351033593285:web:8f5c42fd9d91415a32cfac",
    measurementId: "G-P3PC2K9GQ0"
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
        const username = document.getElementById('Uname').value;

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
            window.location.href = '../homepage/home.html';
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                showMessage('Email Already Exists!', 'sinUpMessage');
            } else {
                showMessage('Unable to create User!', 'sinUpMessage');
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
                showMessage('Sign In Failed!', 'sinInMessage');
            }
            console.error("Error signing in:", error);
        }
    });
}
