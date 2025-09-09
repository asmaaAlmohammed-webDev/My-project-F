import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import i18n from '../i18n';

// ADDED: Product service functions to replace mock data with real API calls
// This service handles all product and category related API interactions

/**
 * Get authentication headers with JWT token
 * ADDED: Helper function to include authorization headers for protected routes
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get current language for API requests
 * ADDED: Helper function to get current language from i18n
 */
const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

/**
 * Fetch all products from backend with localization
 * UPDATED: Now supports Arabic/English descriptions based on current language
 */
export const fetchProducts = async () => {
  try {
    const lang = getCurrentLanguage();
    const response = await axios.get(`${API_ENDPOINTS.PRODUCTS}?lang=${lang}`);
    return response.data.data?.products || response.data.doc || response.data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // ADDED: Fallback to empty array if API fails
    return [];
  }
};

/**
 * Fetch all products for admin (without localization) - includes description_en and description_ar
 * ADDED: For admin panel to get raw data with all language fields
 */
export const fetchProductsForAdmin = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_ENDPOINTS.PRODUCTS}/all`, { headers });
    return response.data.doc || response.data.products || [];
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return [];
  }
};

/**
 * Fetch all categories from backend
 * UPDATED: No authentication required for browsing categories (public access)
 */
export const fetchCategories = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.CATEGORIES);
    return response.data.doc || response.data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Fetch products by category
 * ADDED: Filter products by category for better organization
 */
export const fetchProductsByCategory = async (categoryName) => {
  try {
    const products = await fetchProducts();
    return products.filter(product => 
      product.categoryId?.name?.toLowerCase() === categoryName.toLowerCase()
    );
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

/**
 * Fetch popular books (first 5 products)
 * REPLACES: PopularBooksData.jsx
 */
export const fetchPopularBooks = async () => {
  try {
    const products = await fetchProducts();
    // Return first 5 products as "popular"
    return products.slice(0, 5);
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return [];
  }
};

/**
 * Fetch new arrivals (last 4 products)
 * REPLACES: NewArrivalsData.jsx
 */
export const fetchNewArrivals = async () => {
  try {
    const products = await fetchProducts();
    // Return last 4 products as "new arrivals"
    return products.slice(-4);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
};

/**
 * Fetch single product by ID
 * UPDATED: No authentication required for viewing product details (public access)
 */
export const fetchProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
    return response.data.doc || response.data.product;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

// ADDED: Admin functions for product management (future use)
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(API_ENDPOINTS.PRODUCTS, productData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await axios.patch(`${API_ENDPOINTS.PRODUCTS}/${productId}`, productData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    await axios.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}`, {
      headers: getAuthHeaders()
    });
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
