let container = document.getElementById('container');


// Toggle between Sign In and Sign Up forms
const toggle = () => {
    container.classList.toggle('sign-in');
    container.classList.toggle('sign-up');
};

// Show Sign In form by default
setTimeout(() => {
    container.classList.add('sign-in');
}, 200);

// Show Forgot Password form
const showForgotPassword = () => {
    document.querySelector('.forgot-password-form').style.display = 'block';
};

// Show Reset Password form
const showResetPassword = () => {
    document.querySelector('.reset-password-form').style.display = 'block';
};

// Hide all forms
const hideAllForms = () => {
    document.querySelector('.forgot-password-form').style.display = 'none';
    document.querySelector('.reset-password-form').style.display = 'none';
};

// Event listeners for showing/hiding forms
document.querySelector('.form.sign-in b').addEventListener('click', () => {
    hideAllForms();
    toggle();
});

document.querySelector('.form.sign-up b').addEventListener('click', () => {
    hideAllForms();
    toggle();
});

document.querySelector('.form .forgot-password-link').addEventListener('click', (event) => {
    event.preventDefault();
    hideAllForms();
    showForgotPassword();
});

document.querySelector('.forgot-password-form button').addEventListener('click', () => {
    // Logic to handle sending reset link can go here
    showResetPassword();
});

document.querySelector('.reset-password-form button').addEventListener('click', () => {
    // Logic to handle resetting password can go here
    hideAllForms();
});



