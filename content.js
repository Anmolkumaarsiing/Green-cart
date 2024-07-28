document.addEventListener('DOMContentLoaded', async () => {
  const pincode = localStorage.getItem('pincode');
  if (!pincode) {
    console.log('No pincode found in localStorage.');
    return;
  }

  try {
    const productResponse = await fetch('https://669e2f559a1bda368005b99b.mockapi.io/Product/ProducData');
    const products = await productResponse.json();
    const filteredProducts = products.filter(product => product.Pincode == pincode);
    renderProducts(filteredProducts);
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
});

function renderProducts(products) {
  const containerGrocery = document.getElementById('containerGrocery');
  const containerScrap = document.getElementById('containerScrap');
  containerGrocery.innerHTML = '';
  containerScrap.innerHTML = '';

  products.forEach(product => {
    const productElement = dynamicSection(product);
    if (product.isScrap) {
      containerScrap.appendChild(productElement);
    } else {
      containerGrocery.appendChild(productElement);
    }
  });
}
