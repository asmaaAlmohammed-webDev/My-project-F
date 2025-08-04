// Image utilities for handling different image sources
// ADDED: Centralized image URL handling to support both local assets and backend served images

/**
 * Get the proper image URL based on the image source
 * @param {string} imageValue - The image filename or URL
 * @returns {string} - The complete image URL
 */
export const getImageUrl = (imageValue) => {
  if (!imageValue) {
    // Return a default fallback image
    return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000";
  }

  // If it's already a complete URL (Cloudinary or other external), return as is
  if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
    return imageValue;
  }

  // If it's a filename, construct the backend static file URL
  // Backend serves static files from public folder at /img/static/
  return `http://localhost:7000/img/static/${imageValue}`;
};

/**
 * Get image URL for product images specifically
 * @param {Object} product - The product object
 * @returns {string} - The complete image URL
 */
export const getProductImageUrl = (product) => {
  return getImageUrl(product?.image);
};
