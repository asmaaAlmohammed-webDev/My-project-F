// Cart Utility Functions
// Centralized cart management for use across components

/**
 * Add item to cart with quantity
 * @param {Object} product - Product object with id, name, price, etc.
 * @param {number} quantity - Quantity to add (default: 1)
 */
export const addToCart = (product, quantity = 1) => {
  console.log('addToCart called with:', product, 'quantity:', quantity); // Debug log
  
  // Get current cart from localStorage
  const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
  console.log('Current cart before adding:', currentCart); // Debug log
  
  // Check if item already exists in cart
  const existingItemIndex = currentCart.findIndex(item => 
    (item.id || item._id) === (product.id || product._id)
  );

  if (existingItemIndex !== -1) {
    // Update quantity if item already exists
    currentCart[existingItemIndex].quantity += quantity;
    console.log('Item already exists, updated quantity'); // Debug log
  } else {
    // Add new item to cart
    const cartItem = {
      id: product.id || product._id,
      name: product.name || product.title,
      price: product.price,
      quantity: quantity,
      image: product.image || product.coverImage || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
      author: product.author || "Unknown Author"
    };
    console.log('Adding new cart item:', cartItem); // Debug log
    currentCart.push(cartItem);
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(currentCart));
  console.log('Cart saved to localStorage:', currentCart); // Debug log
  
  // Dispatch custom event to notify cart components
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  return currentCart;
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID to remove
 */
export const removeFromCart = (productId) => {
  const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
  const updatedCart = currentCart.filter(item => 
    (item.id || item._id) !== productId
  );
  
  localStorage.setItem("cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  return updatedCart;
};

/**
 * Update item quantity in cart
 * @param {string} productId - Product ID
 * @param {number} newQuantity - New quantity
 */
export const updateCartItemQuantity = (productId, newQuantity) => {
  if (newQuantity <= 0) {
    return removeFromCart(productId);
  }

  const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
  const itemIndex = currentCart.findIndex(item => 
    (item.id || item._id) === productId
  );

  if (itemIndex !== -1) {
    currentCart[itemIndex].quantity = newQuantity;
    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
  
  return currentCart;
};

/**
 * Get cart items from localStorage
 */
export const getCartItems = () => {
  const items = JSON.parse(localStorage.getItem("cart") || "[]");
  console.log('getCartItems returning:', items); // Debug log
  return items;
};

/**
 * Get cart total
 */
export const getCartTotal = () => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};

/**
 * Get cart item count
 */
export const getCartItemCount = () => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Clear entire cart
 */
export const clearCart = () => {
  localStorage.removeItem("cart");
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};
