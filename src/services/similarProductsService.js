import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import i18n from '../i18n';

// Create axios instance with base configuration
const api = axios.create({
  timeout: 10000,
});

// Add auth headers to requests (optional for this endpoint)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class SimilarProductsService {
  /**
   * Get similar products using K-means clustering
   * @param {string} productId - The product ID to find similarities for
   * @param {number} limit - Number of similar products to return (default: 6)
   * @returns {Promise} API response with similar products
   */
  static async getSimilarProducts(productId, limit = 6) {
    try {
      const language = i18n.language || 'en';
      
      const response = await api.get(API_ENDPOINTS.SIMILAR_PRODUCTS(productId), {
        params: {
          limit,
          lang: language
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching similar products:', error);
      
      // Return empty result on error instead of throwing
      return {
        status: 'success',
        results: 0,
        data: {
          products: [],
          algorithm: 'fallback',
          message: 'Unable to load similar products at this time'
        }
      };
    }
  }

  /**
   * Admin: Trigger product clusters update
   * @returns {Promise} API response
   */
  static async updateProductClusters() {
    try {
      const response = await api.post(API_ENDPOINTS.PRODUCT_CLUSTERS_UPDATE);
      return response.data;
    } catch (error) {
      console.error('Error updating product clusters:', error);
      throw error;
    }
  }

  /**
   * Format similarity score for display
   * @param {number} score - Similarity score (0-1)
   * @returns {string} Formatted percentage
   */
  static formatSimilarityScore(score) {
    return `${Math.round(score * 100)}%`;
  }

  /**
   * Get similarity reason text
   * @param {object} clusterInfo - Cluster information from API
   * @param {string} language - Current language (en/ar)
   * @returns {string} Localized reason text
   */
  static getSimilarityReason(clusterInfo, language = 'en') {
    if (!clusterInfo) return '';
    
    if (clusterInfo.clusterId === 'category-based') {
      return language === 'ar' 
        ? clusterInfo.reason.replace('Same category:', 'نفس الفئة:')
        : clusterInfo.reason;
    }
    
    const reasons = {
      en: {
        'Similar features and characteristics': 'Similar price, popularity and features',
        'AI recommendation': 'Recommended by AI analysis',
        'default': 'Similar characteristics'
      },
      ar: {
        'Similar features and characteristics': 'سعر وشعبية وخصائص مماثلة',
        'AI recommendation': 'موصى به من خلال تحليل الذكي الاصطناعي',
        'default': 'خصائص مماثلة'
      }
    };
    
    const reason = clusterInfo.reason || 'default';
    return reasons[language]?.[reason] || reasons[language].default;
  }

  /**
   * Check if similar products feature is available
   * @returns {boolean} True if feature is supported
   */
  static isFeatureAvailable() {
    return true; // K-means clustering is always available
  }
}

export default SimilarProductsService;
