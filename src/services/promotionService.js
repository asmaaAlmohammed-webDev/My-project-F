import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Create axios instance with base configuration
const api = axios.create({
  timeout: 10000,
});

// Add auth headers to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class PromotionService {
  // Get user's available promotions
  static async getUserPromotions(orderAmount = 0) {
    try {
      const response = await api.get(API_ENDPOINTS.USER_PROMOTIONS, {
        params: { orderAmount }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user promotions:', error);
      throw error;
    }
  }

  // Get first-time buyer promotions
  static async getFirstTimeBuyerPromotions() {
    try {
      const response = await api.get(API_ENDPOINTS.FIRST_TIME_BUYER_PROMOTIONS);
      return response.data;
    } catch (error) {
      console.error('Error fetching first-time buyer promotions:', error);
      throw error;
    }
  }

  // Get loyalty tier promotions
  static async getLoyaltyPromotions() {
    try {
      const response = await api.get(API_ENDPOINTS.LOYALTY_PROMOTIONS);
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty promotions:', error);
      throw error;
    }
  }

  // Apply promotion code
  static async applyPromotion(promoCode, orderAmount, items = []) {
    try {
      const response = await api.post(API_ENDPOINTS.APPLY_PROMOTION, {
        promoCode,
        orderAmount,
        items
      });
      return response.data;
    } catch (error) {
      console.error('Error applying promotion:', error);
      throw error;
    }
  }

  // Get auto-applicable promotions for cart
  static async getAutoPromotions(orderAmount = 0) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PROMOTIONS}/auto?orderAmount=${orderAmount}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching auto promotions:', error);
      // Return empty array as fallback
      return { data: { autoPromotions: [] } };
    }
  }

  // Validate promotion code
  static async validatePromotion(promoCode, items, subtotal) {
    try {
      const response = await api.post(API_ENDPOINTS.VALIDATE_PROMOTION, {
        promoCode,
        items,
        subtotal
      });
      return response.data;
    } catch (error) {
      console.error('Error validating promotion:', error);
      throw error;
    }
  }

  // Admin: Get all promotions
  static async getAllPromotions(filters = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.PROMOTIONS, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all promotions:', error);
      throw error;
    }
  }

  // Admin: Create promotion
  static async createPromotion(promotionData) {
    try {
      const response = await api.post(API_ENDPOINTS.PROMOTIONS, promotionData);
      return response.data;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }

  // Admin: Update promotion
  static async updatePromotion(promotionId, promotionData) {
    try {
      const response = await api.patch(`${API_ENDPOINTS.PROMOTIONS}/${promotionId}`, promotionData);
      return response.data;
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }

  // Admin: Delete promotion
  static async deletePromotion(promotionId) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.PROMOTIONS}/${promotionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }

  // Admin: Get promotion analytics
  static async getPromotionAnalytics() {
    try {
      const response = await api.get(API_ENDPOINTS.PROMOTION_ANALYTICS);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotion analytics:', error);
      throw error;
    }
  }

  // Get promotion by ID
  static async getPromotionById(promotionId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PROMOTIONS}/${promotionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotion:', error);
      throw error;
    }
  }

  // Helper: Calculate discount amount
  static calculateDiscountAmount(orderAmount, discountType, discountValue, maxDiscountAmount = null) {
    let discountAmount = 0;
    
    switch (discountType) {
      case 'percentage':
        discountAmount = (orderAmount * discountValue) / 100;
        if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
          discountAmount = maxDiscountAmount;
        }
        break;
      case 'fixed_amount':
        discountAmount = Math.min(discountValue, orderAmount);
        break;
      case 'free_shipping':
        // This would be handled in shipping calculation
        discountAmount = 0;
        break;
      default:
        discountAmount = 0;
    }
    
    return Math.round(discountAmount * 100) / 100;
  }

  // Helper: Format discount display
  static formatDiscountDisplay(discountType, discountValue, maxDiscountAmount = null) {
    switch (discountType) {
      case 'percentage':
        if (maxDiscountAmount) {
          return `${discountValue}% off (up to $${maxDiscountAmount})`;
        }
        return `${discountValue}% off`;
      case 'fixed_amount':
        return `$${discountValue} off`;
      case 'free_shipping':
        return 'Free shipping';
      default:
        return 'Discount';
    }
  }

  // Helper: Get loyalty tier info
  static getLoyaltyTierInfo(tier) {
    const tiers = {
      bronze: {
        name: 'Bronze',
        color: '#CD7F32',
        benefits: ['1x points', 'Free shipping over $50'],
        nextTier: 'silver',
        spending: 200
      },
      silver: {
        name: 'Silver',
        color: '#C0C0C0',
        benefits: ['1.2x points', '5% discount', 'Free shipping over $40'],
        nextTier: 'gold',
        spending: 500
      },
      gold: {
        name: 'Gold',
        color: '#FFD700',
        benefits: ['1.5x points', '10% discount', 'Free shipping over $30', 'Early access'],
        nextTier: 'platinum',
        spending: 1000
      },
      platinum: {
        name: 'Platinum',
        color: '#E5E4E2',
        benefits: ['2x points', '15% discount', 'Free shipping', 'Early access'],
        nextTier: null,
        spending: null
      }
    };
    
    return tiers[tier] || tiers.bronze;
  }
}

export default PromotionService;
