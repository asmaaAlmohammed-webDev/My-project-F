import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isAuthenticated, isAdmin } from '../../utils/auth';
import BookReviews from '../BookReviews/BookReviews';
import AddReview from '../AddReview/AddReview';
import SimilarProducts from '../SimilarProducts/SimilarProducts';
import ReviewStars from '../ReviewStars/ReviewStars';
import { addToCart } from '../../utils/cartUtils';
import { checkUserProductReview } from '../../services/reviewService';
import './BookDetail.css';

const BookDetail = ({ book, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('details');
  const [quantity, setQuantity] = useState(1);
  const [showAddReview, setShowAddReview] = useState(false);
  const [userReviewStatus, setUserReviewStatus] = useState({ hasReviewed: false, review: null });
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [refreshReviews, setRefreshReviews] = useState(null);

  // Handler for when a similar product is clicked
  const handleSimilarProductClick = (newBook) => {
    // Reset modal state
    setActiveTab('details');
    setQuantity(1);
    setShowAddReview(false);
    setUserReviewStatus({ hasReviewed: false, review: null });
    setReviewStats({ averageRating: 0, totalReviews: 0 });
    setRefreshReviews(null);
    
    // This will trigger a re-render with the new book data
    // The parent component needs to handle updating the book prop
    if (onClose && typeof onClose === 'function') {
      // Close current modal and reopen with new book
      onClose();
      // Add a small delay to ensure proper state reset
      setTimeout(() => {
        // Trigger navigation to the new book
        const event = new CustomEvent('navigateToBook', { detail: newBook });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  useEffect(() => {
    if (isOpen && book && isAuthenticated() && !isAdmin()) {
      checkUserReview();
    }
    
    // Always load reviews when modal opens, regardless of tab
    if (isOpen && book) {
      // Trigger a refresh to preload reviews
      setRefreshReviews(Date.now());
    }
  }, [isOpen, book]);

  // Add ESC key listener
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const checkUserReview = async () => {
    try {
      const status = await checkUserProductReview(book._id);
      setUserReviewStatus(status);
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const handleAddToCart = () => {
    const productForCart = {
      id: book._id,
      name: book.title || book.name,
      price: book.price,
      image: book.coverImage,
      author: book.author,
      category: book.category,
      description: book.description
    };

    addToCart(productForCart, quantity);
    alert(t('productAddedToCart') || 'Product added to cart!');
  };

  const handleReviewAdded = (newReview) => {
    setShowAddReview(false);
    setUserReviewStatus({ hasReviewed: true, review: newReview });
    // Refresh reviews list
    if (refreshReviews) {
      refreshReviews();
    }
  };

  const handleReviewsLoaded = (stats) => {
    if (stats.refreshReviews) {
      setRefreshReviews(() => stats.refreshReviews);
    }
    setReviewStats({
      averageRating: stats.averageRating || 0,
      totalReviews: stats.totalReviews || 0
    });
  };

  if (!isOpen || !book) return null;

  const canAddReview = isAuthenticated() && !userReviewStatus.hasReviewed;

  return (
    <div className="book-detail-overlay" onClick={onClose}>
      <div className="book-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        {/* Modal Header */}
        <div className="book-detail-header">
          <div className="book-image">
            <img src={book.coverImage} alt={book.title || book.name} />
          </div>
          <div className="book-info">
            <h2 className="book-title">{book.title || book.name}</h2>
            <p className="book-author">{t('author')}: {book.author}</p>
            <p className="book-category">{t('category')}: {book.category}</p>
            <div className="book-rating">
              <ReviewStars rating={reviewStats.averageRating} size="medium" showNumber={true} />
              <span className="review-count">
                ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? t('review') : t('reviews')})
              </span>
            </div>
            <div className="book-price">${book.price?.toFixed(2)}</div>
            
            {/* Add to Cart Section */}
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
              <button onClick={handleAddToCart} className="add-to-cart-btn">
                {t('addToCart')} - ${(book.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            {t('details')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            {t('reviews')} ({reviewStats.totalReviews})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'similar' ? 'active' : ''}`}
            onClick={() => setActiveTab('similar')}
          >
            🤖 {t('similarBooks')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'details' && (
            <div className="details-tab">
              <h3>{t('description')}</h3>
              <p className="book-description">
                {book.description || t('noDescriptionAvailable')}
              </p>
              
              <div className="book-specs">
                <div className="spec-item">
                  <strong>{t('price')}:</strong> ${book.price?.toFixed(2)}
                </div>
                <div className="spec-item">
                  <strong>{t('category')}:</strong> {book.category}
                </div>
                <div className="spec-item">
                  <strong>{t('rating')}:</strong> 
                  <ReviewStars rating={reviewStats.averageRating} size="small" showNumber={true} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              {/* Add Review Section */}
              {isAuthenticated() ? (
                isAdmin() ? (
                  <div className="admin-notice">
                    <div className="login-prompt">
                      <p>{t('adminCannotReview') || 'Administrators cannot add product reviews. Reviews are for customers only.'}</p>
                    </div>
                  </div>
                ) : userReviewStatus.hasReviewed ? (
                  <div className="user-review-status">
                    <div className="already-reviewed">
                      <h4>{t('yourReview')}</h4>
                      <div className="existing-review">
                        <ReviewStars rating={userReviewStatus.review?.rate || 0} size="small" />
                        <p>"{userReviewStatus.review?.message}"</p>
                        <small>{t('reviewedOn')} {new Date(userReviewStatus.review?.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="add-review-section">
                    {!showAddReview ? (
                      <button 
                        className="write-review-btn"
                        onClick={() => setShowAddReview(true)}
                      >
                        ✏️ {t('writeReview')}
                      </button>
                    ) : (
                      <AddReview
                        productId={book._id}
                        onReviewAdded={handleReviewAdded}
                        onCancel={() => setShowAddReview(false)}
                      />
                    )}
                  </div>
                )
              ) : (
                <div className="login-prompt">
                  <p>{t('loginToReview') || 'Please login to write a review'}</p>
                </div>
              )}

              {/* Reviews List */}
              <BookReviews 
                productId={book._id} 
                onReviewsLoaded={handleReviewsLoaded}
              />
            </div>
          )}

          {/* Hidden BookReviews component to preload data */}
          {activeTab !== 'reviews' && (
            <div style={{ display: 'none' }}>
              <BookReviews 
                productId={book._id} 
                onReviewsLoaded={handleReviewsLoaded}
              />
            </div>
          )}

          {activeTab === 'similar' && (
            <div className="similar-tab">
              <div className="ai-badge-large">
                <span className="ai-icon">🤖</span>
                <span className="ai-text">{t('aiPoweredRecommendations')}</span>
              </div>
              <SimilarProducts 
                productId={book._id} 
                currentProduct={book}
                onProductClick={handleSimilarProductClick}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
