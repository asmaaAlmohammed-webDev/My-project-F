import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import i18n from '../i18n';

/**
 * Recommendation service for fetching personalized book recommendations
 * Based on user purchase history and preferred categories
 */

/**
 * Get authentication headers with JWT token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get current language for API requests
 */
const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

/**
 * Fetch personalized recommendations for the logged-in user
 * @returns {Promise<Object>} Recommendation data with preferred category and new books
 */
export const fetchUserRecommendations = async () => {
  try {
    const lang = getCurrentLanguage();
    const headers = getAuthHeaders();
    
    const response = await axios.get(`${API_ENDPOINTS.MY_RECOMMENDATIONS}?lang=${lang}`, {
      headers: headers
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    
    // Return empty state for recommendations on error
    return {
      hasRecommendations: false,
      message: 'Unable to load recommendations',
      recommendations: []
    };
  }
};

/**
 * Mark recommendations as seen (user dismissed the popup)
 * @returns {Promise<boolean>} Success status
 */
export const markRecommendationsSeen = async () => {
  try {
    await axios.post(API_ENDPOINTS.MARK_RECOMMENDATIONS_SEEN, {}, {
      headers: getAuthHeaders()
    });
    
    return true;
  } catch (error) {
    console.error('Error marking recommendations as seen:', error);
    return false;
  }
};

/**
 * Format recommendation data for display in popup
 * @param {Object} recommendationData - Raw recommendation data from API
 * @returns {Object} Formatted data for UI display
 */
export const formatRecommendationDisplay = (recommendationData) => {
  if (!recommendationData.hasRecommendations) {
    return null;
  }

  const { preferredCategory, newBooksCount, recommendations, personalizedMessage } = recommendationData;
  const isArabic = i18n.language === 'ar';
  
  return {
    title: isArabic ? 'اقتراحات مخصصة لك' : 'Personalized Recommendations',
    message: personalizedMessage[isArabic ? 'ar' : 'en'],
    category: preferredCategory,
    bookCount: newBooksCount,
    books: recommendations.map(book => ({
      id: book._id,
      title: book.name,
      price: book.price,
      category: book.categoryId?.name || 'Unknown',
      description: book.description,
      image: book.image
    })),
    ctaText: isArabic ? 'استكشف الآن' : 'Explore Now',
    dismissText: isArabic ? 'إغلاق' : 'Close'
  };
};

/**
 * Check if user should see recommendations popup
 * This can be called on login or homepage visit
 * @returns {Promise<Object|null>} Formatted recommendation data or null
 */
export const checkForRecommendations = async () => {
  try {
    // Only check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const recommendationData = await fetchUserRecommendations();
    
    if (!recommendationData.hasRecommendations) {
      return null;
    }

    return formatRecommendationDisplay(recommendationData);
  } catch (error) {
    console.error('Error checking for recommendations:', error);
    return null;
  }
};

export default {
  fetchUserRecommendations,
  markRecommendationsSeen,
  formatRecommendationDisplay,
  checkForRecommendations
};
