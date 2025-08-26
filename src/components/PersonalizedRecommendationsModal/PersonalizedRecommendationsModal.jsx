import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProductImageUrl } from '../../utils/imageUtils';
import { fetchUserRecommendations, markRecommendationsSeen } from '../../services/recommendationService';
import './PersonalizedRecommendationsModal.css';

const PersonalizedRecommendationsModal = ({ 
  isOpen,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendationData, setRecommendationData] = useState(null);
  const [rawApiResponse, setRawApiResponse] = useState(null); // Store raw API response

  // Load recommendations when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRecommendations();
    }
  }, [isOpen]);

  // Reload recommendations when language changes
  useEffect(() => {
    if (isOpen && rawApiResponse) {
      transformRecommendationData(rawApiResponse);
    }
  }, [i18n.language]);

  // Transform API response based on current language
  const transformRecommendationData = (response) => {
    const transformedData = {
      title: t('personalizedRecommendations', 'Just for You!'),
      message: t('recommendationsMessage', 'Based on your recent purchases, we found some books you might love:'),
      category: response.preferredCategory || t('books', 'Books'),
      bookCount: response.recommendations.length,
      books: response.recommendations.map(book => ({
        id: book._id,
        title: book.name, // API uses 'name' field, not 'title'
        price: book.price,
        image: book.image
      })),
      ctaText: t('exploreMore', 'Explore More'),
      dismissText: t('maybeLater', 'Maybe Later')
    };
    
    setRecommendationData(transformedData);
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetchUserRecommendations();
      
      if (response.hasRecommendations && response.recommendations.length > 0) {
        // Store raw response for language switching
        setRawApiResponse(response);
        transformRecommendationData(response);
      } else {
        // No recommendations available, close modal immediately
        onClose();
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      // If error, close modal
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="recommendations-modal-overlay">
        <div className={`recommendations-modal ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
          <div className="recommendations-loading">
            <div className="loading-spinner"></div>
            <p>{t('loadingRecommendations', 'Loading your recommendations...')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show modal if no recommendations
  if (!recommendationData) {
    return null;
  }

  const handleClose = async () => {
    setIsClosing(true);
    
    // Mark recommendations as seen in backend
    await markRecommendationsSeen();
    
    // Small delay for animation
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleExplore = () => {
    // Navigate to shop with category filter
    navigate(`/shop?category=${encodeURIComponent(recommendationData.category)}`);
    
    // Close modal
    handleClose();
  };

  const handleBookClick = (bookTitle) => {
    // Navigate to shop with search for specific book
    navigate(`/shop?search=${encodeURIComponent(bookTitle)}`);
    handleClose();
  };

  const isArabic = i18n.language === 'ar';

  return (
    <div className={`recommendations-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`recommendations-modal ${isArabic ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="recommendations-header">
          <div className="recommendations-icon">
            <span className="icon">💡</span>
          </div>
          <h2 className="recommendations-title">
            {recommendationData.title}
          </h2>
          <button 
            className="close-btn"
            onClick={handleClose}
            aria-label={t('close', 'Close')}
          >
            ×
          </button>
        </div>

        {/* Message */}
        <div className="recommendations-message">
          <p>{recommendationData.message}</p>
          <div className="category-highlight">
            <span className="category-label">
              {t('preferredCategory', 'Your preferred category:')}
            </span>
            <span className="category-name">
              {recommendationData.category}
            </span>
            <span className="book-count">
              ({recommendationData.bookCount} {t('newBooks', 'new books')})
            </span>
          </div>
        </div>

        {/* Books Grid */}
        <div className="recommendations-books">
          {recommendationData.books.slice(0, 3).map((book) => (
            <div 
              key={book.id} 
              className="recommendation-book"
              onClick={() => handleBookClick(book.title)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleBookClick(book.title);
                }
              }}
            >
              <div className="book-image">
                <img 
                  src={getProductImageUrl({ image: book.image })} 
                  alt={book.title}
                  onError={(e) => {
                    e.target.src = '/placeholder-book.png';
                  }}
                />
                <div className="book-overlay">
                  <span className="view-book">
                    {t('viewBook', 'View Book')}
                  </span>
                </div>
              </div>
              <div className="book-info">
                <h4 className="book-title">{book.title}</h4>
                <p className="book-price">${book.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="recommendations-actions">
          <button 
            className="explore-btn"
            onClick={handleExplore}
          >
            <span className="btn-icon">🔍</span>
            {recommendationData.ctaText}
          </button>
          <button 
            className="dismiss-btn"
            onClick={handleClose}
          >
            {recommendationData.dismissText}
          </button>
        </div>

        {/* Decorative elements */}
        <div className="recommendations-decoration">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">⭐</div>
          <div className="sparkle sparkle-3">💫</div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRecommendationsModal;
