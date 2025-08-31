// Language Utility Functions
import i18n from '../i18n';

/**
 * Get current language from i18n
 */
export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

/**
 * Check if current language is Arabic
 */
export const isArabic = () => {
  return getCurrentLanguage() === 'ar';
};

/**
 * Check if current language is English
 */
export const isEnglish = () => {
  return getCurrentLanguage() === 'en';
};

/**
 * Change language
 */
export const changeLanguage = (language) => {
  i18n.changeLanguage(language);
};

/**
 * Get text direction based on current language
 */
export const getTextDirection = () => {
  return isArabic() ? 'rtl' : 'ltr';
};

/**
 * Get language-specific content from object
 */
export const getLocalizedContent = (content, field = 'description') => {
  if (!content) return '';
  
  const lang = getCurrentLanguage();
  const langField = `${field}_${lang}`;
  
  // Try language-specific field first
  if (content[langField]) {
    return content[langField];
  }
  
  // Fallback to generic field
  if (content[field]) {
    return content[field];
  }
  
  // Fallback to English if available
  const enField = `${field}_en`;
  if (content[enField]) {
    return content[enField];
  }
  
  // Last resort fallback
  return content.description_en || content.description || 'No description available';
};

/**
 * Format numbers based on language locale
 */
export const formatNumber = (number) => {
  const lang = getCurrentLanguage();
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US').format(number);
};

/**
 * Format currency based on language locale
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const lang = getCurrentLanguage();
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format date based on language locale
 */
export const formatDate = (date, options = {}) => {
  const lang = getCurrentLanguage();
  const dateObj = new Date(date);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', defaultOptions).format(dateObj);
};

export default {
  getCurrentLanguage,
  isArabic,
  isEnglish,
  changeLanguage,
  getTextDirection,
  getLocalizedContent,
  formatNumber,
  formatCurrency,
  formatDate
};
