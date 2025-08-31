// User Authentication Utility
import { jwtDecode } from 'jwt-decode';

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decoded = jwtDecode(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    localStorage.removeItem('token'); // Remove invalid token
    return false;
  }
};

/**
 * Get current user information from token
 */
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode(token);
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp,
      iat: decoded.iat
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Save authentication token
 */
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Logout user
 */
export const logout = () => {
  removeToken();
  window.location.href = '/login';
};

/**
 * Check if user has specific role
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  return hasRole('ADMIN');
};

/**
 * Check if user is regular user
 */
export const isUser = () => {
  return hasRole('USER');
};
