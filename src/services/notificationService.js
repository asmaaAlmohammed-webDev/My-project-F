import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

/**
 * Notification Service
 * Handles all notification-related API calls and local storage management
 */

// Get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Get all notifications for the current user
 */
export const getMyNotifications = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.MY_NOTIFICATIONS, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.UNREAD_COUNT, {
      headers: getAuthHeaders()
    });
    return response.data.data.unreadCount;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

/**
 * Get login notifications (promotions and important alerts)
 */
export const getLoginNotifications = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.LOGIN_NOTIFICATIONS, {
      headers: getAuthHeaders()
    });
    return response.data.data.notifications;
  } catch (error) {
    console.error('Error fetching login notifications:', error);
    return [];
  }
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(API_ENDPOINTS.MARK_READ(notificationId), {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.patch(API_ENDPOINTS.MARK_ALL_READ, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Admin: Create a new notification
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post(API_ENDPOINTS.NOTIFICATIONS, notificationData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Admin: Get all notifications
 */
export const getAllNotifications = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.NOTIFICATIONS, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    throw error;
  }
};

/**
 * Admin: Update notification
 */
export const updateNotification = async (notificationId, updateData) => {
  try {
    const response = await axios.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`, updateData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

/**
 * Admin: Delete notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Admin: Get notification statistics
 */
export const getNotificationStats = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.NOTIFICATION_STATS, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
};

/**
 * Admin: Toggle notification status (active/inactive)
 */
export const toggleNotificationStatus = async (notificationId) => {
  try {
    const response = await axios.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/toggle-status`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling notification status:', error);
    throw error;
  }
};

/**
 * Local storage functions for caching notifications
 */

/**
 * Cache login notifications to avoid multiple API calls
 */
export const cacheLoginNotifications = (notifications) => {
  try {
    const cacheData = {
      notifications,
      timestamp: Date.now()
    };
    localStorage.setItem('loginNotifications', JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching login notifications:', error);
  }
};

/**
 * Get cached login notifications (valid for 5 minutes)
 */
export const getCachedLoginNotifications = () => {
  try {
    const cached = localStorage.getItem('loginNotifications');
    if (cached) {
      const cacheData = JSON.parse(cached);
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      // Return cached data if it's less than 5 minutes old
      if (cacheData.timestamp > fiveMinutesAgo) {
        return cacheData.notifications;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cached login notifications:', error);
    return null;
  }
};

/**
 * Clear notification cache
 */
export const clearNotificationCache = () => {
  try {
    localStorage.removeItem('loginNotifications');
  } catch (error) {
    console.error('Error clearing notification cache:', error);
  }
};

/**
 * Store dismissed notification IDs to avoid showing them again in the same session
 */
export const addDismissedNotification = (notificationId) => {
  try {
    const dismissed = getDismissedNotifications();
    dismissed.add(notificationId);
    localStorage.setItem('dismissedNotifications', JSON.stringify([...dismissed]));
  } catch (error) {
    console.error('Error adding dismissed notification:', error);
  }
};

/**
 * Get dismissed notification IDs
 */
export const getDismissedNotifications = () => {
  try {
    const dismissed = localStorage.getItem('dismissedNotifications');
    return new Set(dismissed ? JSON.parse(dismissed) : []);
  } catch (error) {
    console.error('Error getting dismissed notifications:', error);
    return new Set();
  }
};

/**
 * Clear dismissed notifications (called on logout or session end)
 */
export const clearDismissedNotifications = () => {
  try {
    localStorage.removeItem('dismissedNotifications');
  } catch (error) {
    console.error('Error clearing dismissed notifications:', error);
  }
};
