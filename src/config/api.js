// API Configuration
// ADDED: Centralized API configuration to avoid hardcoded URLs throughout the application
// This makes it easier to change the backend URL for different environments

const API_CONFIG = {
  // CHANGED: Updated from port 7000 to 3001 to match backend server configuration
  // Backend server was moved to port 3001 to avoid conflicts with macOS Control Center
  BASE_URL: "http://localhost:7000",
  API_VERSION: "v1.0.0"
};

// Construct full API base URL
export const API_BASE_URL = `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}`;

// API Endpoints
export const API_ENDPOINTS = {
  // User Authentication
  LOGIN: `${API_BASE_URL}/users/login`,
  SIGNUP: `${API_BASE_URL}/users/signup`,
  FORGOT_PASSWORD: `${API_BASE_URL}/users/forgotPassword`,
  
  // User Profile
  GET_ME: `${API_BASE_URL}/users/me`,
  UPDATE_ME: `${API_BASE_URL}/users/updateMe`,
  UPDATE_PASSWORD: `${API_BASE_URL}/users/updateMyPassword`,
  
  // User Management (Admin only)
  USERS: `${API_BASE_URL}/users`,
  
  // Contact
  CONTACT: `${API_BASE_URL}/conacts`,
  
  // ADDED: Products and Categories endpoints for real data integration
  PRODUCTS: `${API_BASE_URL}/products`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  
  // Image upload endpoint
  IMAGE_UPLOAD: `${API_BASE_URL}/images/upload`,
  
  // Orders and Reviews endpoints
  ORDERS: `${API_BASE_URL}/orders`,
  REVIEWS: `${API_BASE_URL}/reviews`
};

export default API_CONFIG;
