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
