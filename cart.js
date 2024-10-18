console.clear();

if (document.cookie.indexOf(',counter=') >= 0) {
    let counter = document.cookie.split(',')[1].split('=')[1];
    document.getElementById("badge").innerHTML = counter;
}

let cartContainer = document.getElementById('cartContainer');

// DYNAMIC CODE TO SHOW THE SELECTED ITEMS IN YOUR CART
function dynamicCartSection(ob, itemCounter) {
    let productDiv = document.createElement('div');
    productDiv.classList.add('product');
    
    let imgDiv = document.createElement('div');
    imgDiv.classList.add('product-image');
    let img = document.createElement('img');
    img.src = ob.preview;
    imgDiv.appendChild(img);
    
    let detailsDiv = document.createElement('div');
    detailsDiv.classList.add('product-details');
    let title = document.createElement('div');
    title.classList.add('product-title');
    title.textContent = ob.name;
    detailsDiv.appendChild(title);
    
    let description = document.createElement('p');
    description.classList.add('product-description');
    description.textContent = "Product description here."; // Add proper description if available
    detailsDiv.appendChild(description);
    
    let priceDiv = document.createElement('div');
    priceDiv.classList.add('product-price');
    priceDiv.textContent = ob.price.toFixed(2);
    
    let quantityDiv = document.createElement('div');
    quantityDiv.classList.add('product-quantity');
    let quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.value = itemCounter;
    quantityInput.min = 1;
    quantityInput.onchange = () => {
        updateCart();
    };
    quantityDiv.appendChild(quantityInput);
    
    let removalDiv = document.createElement('div');
    removalDiv.classList.add('product-removal');
    let removeButton = document.createElement('button');
    removeButton.classList.add('remove-product');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => {
        productDiv.remove();
        updateCart();
    };
    removalDiv.appendChild(removeButton);
    
    let linePriceDiv = document.createElement('div');
    linePriceDiv.classList.add('product-line-price');
    linePriceDiv.textContent = (ob.price * itemCounter).toFixed(2);

    productDiv.appendChild(imgDiv);
    productDiv.appendChild(detailsDiv);
    productDiv.appendChild(priceDiv);
    productDiv.appendChild(quantityDiv);
    productDiv.appendChild(removalDiv);
    productDiv.appendChild(linePriceDiv);
    
    cartContainer.appendChild(productDiv);
    updateCart(); // Update totals
}

// TO UPDATE TOTALS
function updateCart() {
    let subtotal = 0;
    const products = document.querySelectorAll('.product');
    products.forEach((product) => {
        const linePrice = parseFloat(product.querySelector('.product-line-price').textContent);
        subtotal += linePrice;
    });

    const tax = subtotal * 0.05;
    const shipping = 15.00;
    const total = subtotal + tax + shipping;

    document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('cart-tax').textContent = tax.toFixed(2);
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// BACKEND CALL
let httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function() {
    if (this.readyState === 4) {
        if (this.status == 200) {
            let contentTitle = JSON.parse(this.responseText);
            console.log("Current cookies:", document.cookie);

            if (document.cookie.indexOf(',counter=') >= 0) {
                let counter = Number(document.cookie.split(',')[1].split('=')[1]);
                document.getElementById("totalItem").innerHTML = ('Total Items: ' + counter);

                let itemParts = document.cookie.split(',')[0].split('=');
                if (itemParts.length > 1) {
                    let item = itemParts[1].trim().split(" ");
                    for (let i = 0; i < counter; i++) {
                        let itemCounter = 1;
                        for (let j = i + 1; j < counter; j++) {   
                            if (Number(item[j]) == Number(item[i])) {
                                itemCounter += 1;
                            }
                        }
                        dynamicCartSection(contentTitle[item[i] - 1], itemCounter);
                        i += (itemCounter - 1);
                    }
                }
            }
        } else {
            console.log('call failed!');
        }
    }
}

httpRequest.open('GET', 'https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData', true);
httpRequest.send();
