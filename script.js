// Initialize cart state from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartCount = cart.reduce((total, item) => total + item.quantity, 0);
let cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

// DOM Elements (conditionally select based on the current page)
const cartItemsList = document.getElementById('cart-items');
const cartCountElement = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');

// Update cart count in the navigation bar
if (cartCountElement) {
  cartCountElement.textContent = cartCount;
}

// Add event listeners to all "Add to Cart" buttons on the shop page
if (document.querySelectorAll('.add-to-cart')) {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', addToCart);
  });
}

function addToCart(event) {
  const productElement = event.target.closest('.product');
  const productId = productElement.getAttribute('data-id');
  const productName = productElement.querySelector('h3').textContent;
  const productPrice = parseFloat(productElement.querySelector('p').textContent.replace('$', ''));

  // Check if the product is already in the cart
  const existingProduct = cart.find(item => item.id === productId);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
  }

  // Update cart count and total
  cartCount += 1;
  cartTotal += productPrice;

  // Save cart to localStorage
  saveCartToLocalStorage();

  // Update cart UI if on the cart page
  if (cartItemsList) updateCartUI();
  if (cartCountElement) cartCountElement.textContent = cartCount; // Update cart count in the nav bar
}

function removeFromCart(productId) {
  const productIndex = cart.findIndex(item => item.id === productId);
  if (productIndex !== -1) {
    const removedProduct = cart[productIndex];
    cartCount -= removedProduct.quantity;
    cartTotal -= removedProduct.price * removedProduct.quantity;
    cart.splice(productIndex, 1);

    // Save cart to localStorage
    saveCartToLocalStorage();

    // Update cart UI
    updateCartUI();
    if (cartCountElement) cartCountElement.textContent = cartCount; // Update cart count in the nav bar
  }
}

function updateQuantity(productId, newQuantity) {
  const product = cart.find(item => item.id === productId);
  if (product) {
    const oldQuantity = product.quantity;
    const difference = newQuantity - oldQuantity;

    // Update the product's quantity
    product.quantity = newQuantity;

    // Update cart count and total
    cartCount += difference;
    cartTotal += product.price * difference;

    // If the quantity reaches 0, remove the item from the cart
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      // Save cart to localStorage
      saveCartToLocalStorage();

      // Update cart UI
      updateCartUI();
      if (cartCountElement) cartCountElement.textContent = cartCount; // Update cart count in the nav bar
    }
  }
}

function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  // Clear the cart items list
  cartItemsList.innerHTML = '';

  // Update the cart items list
  cart.forEach(item => {
    const listItem = document.createElement('li');

    // Quantity controls
    const quantityControls = document.createElement('div');
    quantityControls.classList.add('quantity-controls');

    const lessButton = document.createElement('button');
    lessButton.textContent = '-';
    lessButton.addEventListener('click', () => updateQuantity(item.id, item.quantity - 1));

    const quantityDisplay = document.createElement('span');
    quantityDisplay.textContent = item.quantity;

    const moreButton = document.createElement('button');
    moreButton.textContent = '+';
    moreButton.addEventListener('click', () => updateQuantity(item.id, item.quantity + 1));

    quantityControls.appendChild(lessButton);
    quantityControls.appendChild(quantityDisplay);
    quantityControls.appendChild(moreButton);

    // Product details
    const productDetails = document.createElement('span');
    productDetails.textContent = `${item.name} - $${(item.price * item.quantity).toFixed(2)}`;

    // Remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-btn');
    removeButton.addEventListener('click', () => removeFromCart(item.id));

    // Combine everything into the list item
    listItem.appendChild(quantityControls);
    listItem.appendChild(productDetails);
    listItem.appendChild(removeButton);

    cartItemsList.appendChild(listItem);
  });

  // Update cart count and total
  if (cartCountElement) cartCountElement.textContent = cartCount;
  if (cartTotalElement) cartTotalElement.textContent = cartTotal.toFixed(2);
}

// Initialize cart UI when the cart page loads
if (cartItemsList) updateCartUI();
