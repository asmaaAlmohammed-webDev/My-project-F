import { API_ENDPOINTS } from '../config/api';
import { getCurrentLanguage } from '../utils/languageUtils';
import { getAuthHeaders } from '../utils/auth';

/**
 * Get all reviews for a specific product
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} Reviews data with stats
 */
export const getProductReviews = async (productId) => {
  try {
    const lang = getCurrentLanguage();
    const response = await fetch(
      `${API_ENDPOINTS.REVIEWS}/product/${productId}?lang=${lang}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }

    const data = await response.json();
    return data.data; // Returns { reviews: [], stats: {} }
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return { reviews: [], stats: { totalReviews: 0, averageRating: 0, ratingDistribution: [] } };
  }
};

/**
 * Add a review for a specific product
 * @param {string} productId - The product ID
 * @param {Object} reviewData - Review data { message, rate }
 * @returns {Promise<Object>} Created review
 */
export const addProductReview = async (productId, reviewData) => {
  try {
    const authHeaders = getAuthHeaders();
    const lang = getCurrentLanguage();
    
    const response = await fetch(
      `${API_ENDPOINTS.REVIEWS}/product/${productId}?lang=${lang}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(reviewData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add review');
    }

    const data = await response.json();
    return data.data.review;
  } catch (error) {
    console.error('Error adding product review:', error);
    throw error;
  }
};

/**
 * Check if the current user has already reviewed a product
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} { hasReviewed: boolean, review: Object|null }
 */
export const checkUserProductReview = async (productId) => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await fetch(
      `${API_ENDPOINTS.REVIEWS}/product/${productId}/check`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check user review');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error checking user review:', error);
    return { hasReviewed: false, review: null };
  }
};

/**
 * Format rating as stars
 * @param {number} rating - Rating from 1-5
 * @returns {string} Star representation
 */
export const formatRatingStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
};

/**
 * Get color for rating
 * @param {number} rating - Rating from 1-5
 * @returns {string} CSS color
 */
export const getRatingColor = (rating) => {
  const colors = {
    5: '#27ae60', // Green
    4: '#2ecc71', // Light green
    3: '#f39c12', // Orange
    2: '#e67e22', // Dark orange
    1: '#e74c3c'  // Red
  };
  return colors[Math.round(rating)] || '#bdc3c7';
};

/**
 * Format review date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatReviewDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  
  return date.toLocaleDateString();
};

export default {
  getProductReviews,
  addProductReview,
  checkUserProductReview,
  formatRatingStars,
  getRatingColor,
  formatReviewDate
};
