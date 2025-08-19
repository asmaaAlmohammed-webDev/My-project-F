import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  getLoginNotifications, 
  markNotificationAsRead,
  addDismissedNotification,
  getDismissedNotifications 
} from '../../services/notificationService';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, showOnLogin = false }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRTL = i18n.language === 'ar';

  // Language toggle function
  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  // Load notifications when modal opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const loginNotifications = await getLoginNotifications();
      
      // Filter out dismissed notifications if this is a login modal
      let filteredNotifications = loginNotifications;
      if (showOnLogin) {
        const dismissed = getDismissedNotifications();
        filteredNotifications = loginNotifications.filter(
          notification => !dismissed.has(notification._id)
        );
      }
      
      setNotifications(filteredNotifications);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNotificationAction = async (notification) => {
    try {
      // Mark as read
      await markNotificationAsRead(notification._id);
      
      // Add to dismissed if this is a login modal
      if (showOnLogin) {
        addDismissedNotification(notification._id);
      }
      
      // Navigate to action URL if provided
      if (notification.actionUrl) {
        if (notification.actionUrl.startsWith('/')) {
          navigate(notification.actionUrl);
        } else {
          window.open(notification.actionUrl, '_blank');
        }
      } else if (notification.type === 'promotion' || notification.type === 'discount') {
        // Redirect to promotions section in profile
        navigate('/profile#promotions');
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };

  const handleDismiss = (notification) => {
    if (showOnLogin) {
      addDismissedNotification(notification._id);
    }
    
    // If this was the last notification, close modal
    if (notifications.length === 1) {
      onClose();
    } else {
      // Remove this notification from the list
      const updatedNotifications = notifications.filter(n => n._id !== notification._id);
      setNotifications(updatedNotifications);
      
      // Adjust current index if needed
      if (currentIndex >= updatedNotifications.length) {
        setCurrentIndex(Math.max(0, updatedNotifications.length - 1));
      }
    }
  };

  const formatDate = (date) => {
    const locale = isRTL ? 'ar-EG' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getNotificationContent = (notification) => {
    const title = isRTL && notification.titleAr ? notification.titleAr : notification.title;
    const message = isRTL && notification.messageAr ? notification.messageAr : notification.message;
    const actionText = isRTL && notification.actionTextAr ? notification.actionTextAr : notification.actionText;
    
    return { title, message, actionText };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#e74c3c',
      high: '#f39c12',
      medium: '#3498db',
      low: '#95a5a6'
    };
    return colors[priority] || colors.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      promotion: '🎉',
      discount: '💰',
      general: '📢',
      order: '📦',
      system: '⚙️'
    };
    return icons[type] || icons.general;
  };

  if (!isOpen || notifications.length === 0) {
    return null;
  }

  const currentNotification = notifications[currentIndex];
  const { title, message, actionText } = getNotificationContent(currentNotification);

  return (
    <div className={`notification-modal-overlay ${isRTL ? 'rtl' : ''}`}>
      <div className="notification-modal">
        {/* Header */}
        <div className="notification-header">
          <div className="notification-title">
            <span className="notification-icon">
              {getTypeIcon(currentNotification.type)}
            </span>
            <span>{showOnLogin ? t('importantUpdates') : t('notifications')}</span>
            {notifications.length > 1 && (
              <span className="notification-counter">
                {currentIndex + 1} / {notifications.length}
              </span>
            )}
          </div>
          <div className="header-controls">
            {/* Language Toggle Button */}
            <button 
              className="lang-toggle-btn"
              onClick={handleLanguageToggle}
              title={t('switchLanguage')}
            >
              {i18n.language === 'ar' ? 'EN' : 'ع'}
            </button>
            
            <button 
              className="close-btn"
              onClick={onClose}
              title={t('close')}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="notification-loading">
            <div className="loading-spinner"></div>
            <p>{t('loadingNotifications')}</p>
          </div>
        )}

        {/* Notification Content */}
        {!loading && currentNotification && (
          <div className="notification-content">
            {/* Priority Indicator */}
            <div 
              className="priority-indicator"
              style={{ backgroundColor: getPriorityColor(currentNotification.priority) }}
            >
              <span className="priority-text">
                {t(currentNotification.priority + 'Priority')}
              </span>
            </div>

            {/* Image */}
            {currentNotification.imageUrl && (
              <div className="notification-image">
                <img 
                  src={currentNotification.imageUrl} 
                  alt={title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="notification-body">
              <h3 className="notification-title-text">{title}</h3>
              <p className="notification-message">{message}</p>

              {/* Promotion Details */}
              {(currentNotification.type === 'promotion' || currentNotification.type === 'discount') && 
               currentNotification.promotionData && (
                <div className="promotion-details">
                  {currentNotification.promotionData.discountPercentage && (
                    <div className="discount-badge">
                      <span className="discount-value">
                        {currentNotification.promotionData.discountPercentage}%
                      </span>
                      <span className="discount-label">{t('off')}</span>
                    </div>
                  )}
                  
                  {currentNotification.promotionData.discountAmount && (
                    <div className="discount-badge">
                      <span className="discount-value">
                        ${currentNotification.promotionData.discountAmount}
                      </span>
                      <span className="discount-label">{t('off')}</span>
                    </div>
                  )}

                  {currentNotification.promotionData.promoCode && (
                    <div className="promo-code">
                      <span className="promo-label">{t('promoCode')}:</span>
                      <span className="promo-value">{currentNotification.promotionData.promoCode}</span>
                      <button 
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(currentNotification.promotionData.promoCode);
                          // Show copied feedback
                        }}
                        title={t('copyPromoCode')}
                      >
                        📋
                      </button>
                    </div>
                  )}

                  {currentNotification.promotionData.validUntil && (
                    <div className="valid-until">
                      <span>{t('validUntil')}: {formatDate(currentNotification.promotionData.validUntil)}</span>
                    </div>
                  )}

                  {currentNotification.promotionData.minimumOrder > 0 && (
                    <div className="minimum-order">
                      <span>{t('minimumOrder')}: ${currentNotification.promotionData.minimumOrder}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Creation Date */}
              <div className="notification-date">
                <small>{formatDate(currentNotification.createdAt)}</small>
              </div>
            </div>

            {/* Navigation for multiple notifications */}
            {notifications.length > 1 && (
              <div className="notification-navigation">
                <button 
                  className="nav-btn prev-btn"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  title={t('previous')}
                >
                  {isRTL ? '▶' : '◀'}
                </button>
                
                <div className="notification-dots">
                  {notifications.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(index)}
                      title={`${t('notification')} ${index + 1}`}
                    />
                  ))}
                </div>
                
                <button 
                  className="nav-btn next-btn"
                  onClick={handleNext}
                  disabled={currentIndex === notifications.length - 1}
                  title={t('next')}
                >
                  {isRTL ? '◀' : '▶'}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="notification-actions">
              {(actionText || currentNotification.actionUrl || 
                currentNotification.type === 'promotion' || 
                currentNotification.type === 'discount') && (
                <button 
                  className="action-btn primary"
                  onClick={() => handleNotificationAction(currentNotification)}
                >
                  {actionText || 
                   (currentNotification.type === 'promotion' || currentNotification.type === 'discount' 
                    ? t('viewPromotions') 
                    : t('viewDetails'))}
                </button>
              )}
              
              <button 
                className="action-btn secondary"
                onClick={() => handleDismiss(currentNotification)}
              >
                {showOnLogin ? t('dismiss') : t('markAsRead')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
