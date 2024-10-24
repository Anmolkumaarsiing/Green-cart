// Import Firebase Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firebase
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
const productsCollection = collection(db, 'products'); 

// Get references to HTML elements
const productsTable = document.getElementById('productsTable').getElementsByTagName('tbody')[0];
const productSearch = document.getElementById('productSearch');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementsByClassName('close')[0];
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const addBtn = document.getElementById('addBtn'); 
const editBtn = document.getElementById('editBtn'); 

// Function to fetch and display products
async function displayProducts() {
    productsTable.innerHTML = ''; 
    const productsSnapshot = await getDocs(productsCollection);

    productsSnapshot.forEach((doc) => {
        const productData = doc.data();
        const row = productsTable.insertRow();

        addDataToCell(row, productData.id || 'N/A');
        addDataToCell(row, productData.name || 'N/A');
        addDataToCell(row, productData.brand || 'N/A');
        addDataToCell(row, `₹${productData.price.toFixed(2)}` || 'N/A'); 
        addDataToCell(row, productData.isScrap ? 'True' : 'False'); 
        addDataToCell(row, productData.pincode || 'N/A');

        // Add action buttons
        const actionsCell = row.insertCell();
        actionsCell.classList.add('actions-cell');

        const viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.textContent = 'View Product';
        viewDetailsBtn.classList.add('view-details-btn');
        viewDetailsBtn.addEventListener('click', () => openProductModal(doc.id, productData, 'view')); 
        actionsCell.appendChild(viewDetailsBtn);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit Product';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => openProductModal(doc.id, productData, 'edit')); 
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Product';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteProduct(doc.id));
        actionsCell.appendChild(deleteBtn);
    });
}

// Function to truncate and expand descriptions
function truncateDescription(description, maxWords) {
    if (description.split(' ').length > maxWords) {
        const truncated = description.split(' ').slice(0, maxWords).join(' ');
        return `<span class="short-desc">${truncated}</span>... <span class="see-more">[See More]</span>
                <span class="full-desc" style="display:none;">${description}</span>`;
    }
    return description;
}

// Event listener for "See More" links
productsTable.addEventListener('click', (event) => {
    if (event.target.classList.contains('see-more')) {
        const shortDesc = event.target.previousElementSibling;
        const fullDesc = event.target.nextElementSibling;
        shortDesc.style.display = 'none';
        event.target.style.display = 'none';
        fullDesc.style.display = 'inline';
    }
});

// Helper function to format photo URLs
function formatPhotoUrls(photos) {
    return photos ? photos.join('\n') : 'N/A'; 
}

// Helper function to add data to a table cell
function addDataToCell(row, data, fullDescription = '') {
    const cell = row.insertCell();
    cell.innerHTML = data; 

    if (fullDescription) {
        const seeMoreLink = cell.querySelector('.see-more');
        if (seeMoreLink) {
            seeMoreLink.addEventListener('click', () => {
                cell.querySelector('.short-desc').style.display = 'none';
                seeMoreLink.style.display = 'none';
                cell.querySelector('.full-desc').style.display = 'inline';
            });
        }
    }
}

// Function to delete a product
async function deleteProduct(productId) {
    const productDocRef = doc(db, 'products', productId);
    await deleteDoc(productDocRef); 
    displayProducts(); 
}

// Function to open the modal for adding/editing/viewing products
function openProductModal(productId = '', productData = {}, mode = 'add') { 
    productForm.reset(); 

    if (mode === 'add') {
        modalTitle.textContent = 'Add Product';
        addBtn.style.display = 'inline-block'; 
        editBtn.style.display = 'none';
    } else if (mode === 'view') {
        modalTitle.textContent = 'Product Details';
        addBtn.style.display = 'none';
        editBtn.style.display = 'none';
    } else {
        modalTitle.textContent = 'Edit Product';
        addBtn.style.display = 'none';
        editBtn.style.display = 'inline-block';
    }

    if (productId) {
        document.getElementById('productId').value = productData.id || '';
        document.getElementById('productName').value = productData.name || '';
        document.getElementById('productBrand').value = productData.brand || '';
        document.getElementById('productDescription').value = productData.description || '';
        document.getElementById('productPrice').value = productData.price || '';
        document.getElementById('isproductScrap').checked = productData.isScrap || false; 
        document.getElementById('productphotos').value = productData.photos ? productData.photos.join('\n') : ''; 
        document.getElementById('productpincode').value = productData.pincode || '';
        document.getElementById('productpreview').value = productData.preview || '';
    }

    // Make fields readonly for 'view' mode
    if (mode === 'view') {
        const inputs = productForm.querySelectorAll('input, textarea');
        inputs.forEach(input => input.readOnly = true);
        document.getElementById('isproductScrap').disabled = true; 
    } else {
        const inputs = productForm.querySelectorAll('input, textarea');
        inputs.forEach(input => input.readOnly = false);
        document.getElementById('isproductScrap').disabled = false; 
    }

    productModal.style.display = "block"; 
}

// Close the modal
closeModal.onclick = () => {
    productModal.style.display = "none";
}

// Handle form submission for adding a product
addBtn.onclick = async (event) => { 
    event.preventDefault(); 

    const newProduct = {
        id: document.getElementById('productId').value,
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        isScrap: document.getElementById('isproductScrap').checked, 
        photos: document.getElementById('productphotos').value.split('\n'), 
        pincode: parseInt(document.getElementById('productpincode').value),
        preview: document.getElementById('productpreview').value,
    };

    try {
        await addDoc(productsCollection, newProduct);
        console.log("Document written with ID: ", newProduct.id);
        productModal.style.display = "none";
        displayProducts();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

// Handle Edit button click
editBtn.onclick = async (event) => {
    event.preventDefault();

    const productId = document.getElementById('productId').value;
    const updatedProduct = {
        id: document.getElementById('productId').value,
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        isScrap: document.getElementById('isproductScrap').checked,
        photos: document.getElementById('productphotos').value.split('\n'),
        pincode: parseInt(document.getElementById('productpincode').value),
        preview: document.getElementById('productpreview').value,
    };

    try {
        await updateDoc(doc(db, "products", productId), updatedProduct);
        console.log("Document updated with ID: ", productId);
        productModal.style.display = "none";
        displayProducts();
    } catch (error) {
        console.error("Error updating document: ", error);
    }
};

// Event listener for search input
productSearch.addEventListener('input', () => {
    const searchText = productSearch.value.toLowerCase();
    const rows = productsTable.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i].textContent.toLowerCase();
        if (rowData.includes(searchText)) {
            rows[i].style.display = ''; 
        } else {
            rows[i].style.display = 'none'; 
        }
    }
});

// Show modal when "Add Product" button is clicked
addProductBtn.addEventListener('click', () => {
    openProductModal(); 
});

// Initial display of products
displayProducts();
