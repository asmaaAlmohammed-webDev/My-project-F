import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import i18n from '../i18n';

/**
 * News service for fetching newest books data for the moving news bar
 * Handles API calls and caching for optimal performance
 */

/**
 * Get current language for API requests
 */
const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

/**
 * Fetch newest books for the news bar
 * @param {number} limit - Number of books to fetch (default: 8)
 * @returns {Promise<Array>} Array of newest books
 */
export const fetchNewestBooks = async (limit = 8) => {
  try {
    const lang = getCurrentLanguage();
    const response = await axios.get(`${API_ENDPOINTS.NEWEST_BOOKS}?lang=${lang}&limit=${limit}`);
    return response.data.data?.newestBooks || [];
  } catch (error) {
    console.error('Error fetching newest books for news bar:', error);
    return [];
  }
};

/**
 * Format book data for news bar display
 * @param {Object} book - Book object from API
 * @returns {Object} Formatted book data
 */
export const formatBookForNewsBar = (book) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return i18n.t('today', 'Today');
    } else if (diffInDays === 1) {
      return i18n.t('yesterday', 'Yesterday');
    } else if (diffInDays < 7) {
      return i18n.t('daysAgo', `${diffInDays} days ago`);
    } else {
      return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return {
    id: book._id,
    title: book.name,
    category: book.categoryId?.name || 'Unknown',
    price: book.price,
    arrivalText: formatDate(book.arrivalDate),
    image: book.image
  };
};

/**
 * Create news bar text content from books array
 * @param {Array} books - Array of books
 * @returns {Array} Array of formatted news items
 */
export const createNewsBarContent = (books) => {
  return books.map(book => {
    const formattedBook = formatBookForNewsBar(book);
    const isArabic = i18n.language === 'ar';
    
    if (isArabic) {
      return {
        ...formattedBook,
        text: `📚 وصل حديثاً: "${formattedBook.title}" في قسم ${formattedBook.category} - ${formattedBook.arrivalText} 💫`,
        clickableTitle: formattedBook.title,
        isClickable: true
      };
    } else {
      return {
        ...formattedBook,
        text: `📚 New Arrival: "${formattedBook.title}" in ${formattedBook.category} - ${formattedBook.arrivalText} 💫`,
        clickableTitle: formattedBook.title,
        isClickable: true
      };
    }
  });
};

/**
 * Split news text for clickable rendering
 * @param {Object} newsItem - News item object
 * @returns {Object} Object with text parts and clickable title info
 */
export const prepareClickableContent = (newsItem) => {
  if (!newsItem.isClickable) {
    return { 
      hasClickableTitle: false, 
      fullText: newsItem.text 
    };
  }

  const { text, clickableTitle, id, title } = newsItem;
  const titleInQuotes = `"${clickableTitle}"`;
  
  // Split the text by the book title in quotes
  const parts = text.split(titleInQuotes);
  
  if (parts.length === 2) {
    return {
      hasClickableTitle: true,
      beforeTitle: parts[0],
      afterTitle: parts[1],
      titleInQuotes,
      bookId: id,
      bookTitle: title || clickableTitle
    };
  }
  
  // Fallback if parsing fails
  return { 
    hasClickableTitle: false, 
    fullText: text 
  };
};

export default {
  fetchNewestBooks,
  formatBookForNewsBar,
  createNewsBarContent,
  prepareClickableContent
};
