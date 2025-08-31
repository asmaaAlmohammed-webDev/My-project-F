import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReviewStars from '../ReviewStars/ReviewStars';
import { getProductReviews, formatReviewDate, getRatingColor } from '../../services/reviewService';
import './BookReviews.css';

const BookReviews = ({ productId, onReviewsLoaded }) => {
  const { t } = useTranslation();
  const [reviewsData, setReviewsData] = useState({ reviews: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest

  useEffect(() => {
    if (productId) {
      loadReviews();
    }
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProductReviews(productId);
      setReviewsData(data);
      
      if (onReviewsLoaded) {
        onReviewsLoaded(data.stats);
      }
    } catch (err) {
      setError(t('failedLoadReviews') || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const sortReviews = (reviews) => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return sorted.sort((a, b) => b.rate - a.rate);
      case 'lowest':
        return sorted.sort((a, b) => a.rate - b.rate);
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const renderRatingDistribution = () => {
    const { stats } = reviewsData;
    if (!stats.ratingDistribution) return null;

    return (
      <div className="rating-distribution">
        <h4>{t('ratingBreakdown') || 'Rating Breakdown'}</h4>
        <div className="distribution-bars">
          {[5, 4, 3, 2, 1].map(rating => {
            const data = stats.ratingDistribution.find(r => r.rating === rating) || { count: 0, percentage: 0 };
            return (
              <div key={rating} className="distribution-row">
                <span className="rating-label">{rating}★</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${data.percentage}%`,
                      backgroundColor: getRatingColor(rating)
                    }}
                  />
                </div>
                <span className="count">({data.count})</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReviewItem = (review) => (
    <div key={review._id} className="review-item">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.userId?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="reviewer-details">
            <h5 className="reviewer-name">
              {review.userId?.name || t('anonymous') || 'Anonymous User'}
            </h5>
            <div className="review-meta">
              <ReviewStars rating={review.rate} size="small" />
              <span className="review-date">
                {formatReviewDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="review-rating-badge" style={{ backgroundColor: getRatingColor(review.rate) }}>
          {review.rate}
        </div>
      </div>
      
      <div className="review-content">
        <p className="review-message">{review.message}</p>
      </div>
    </div>
  );

  // Refresh function to be called after adding a new review
  const refreshReviews = () => {
    loadReviews();
  };

  // Expose refresh function to parent
  useEffect(() => {
    if (onReviewsLoaded) {
      onReviewsLoaded({ ...reviewsData.stats, refreshReviews });
    }
  }, [reviewsData.stats]);

  if (loading) {
    return (
      <div className="book-reviews loading">
        <div className="loading-spinner"></div>
        <p>{t('loadingReviews') || 'Loading reviews...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-reviews error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadReviews} className="btn btn-primary">
            {t('tryAgain') || 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  const { reviews, stats } = reviewsData;
  const sortedReviews = sortReviews(reviews);

  return (
    <div className="book-reviews">
      {/* Reviews Summary */}
      <div className="reviews-summary">
        <div className="overall-rating">
          <div className="rating-display">
            <span className="avg-rating">{stats.averageRating?.toFixed(1) || '0.0'}</span>
            <div className="rating-details">
              <ReviewStars rating={stats.averageRating || 0} size="medium" showNumber={false} />
              <span className="total-reviews">
                {stats.totalReviews || 0} {stats.totalReviews === 1 ? t('review') : t('reviews')}
              </span>
            </div>
          </div>
        </div>
        
        {stats.totalReviews > 0 && renderRatingDistribution()}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <>
          <div className="reviews-controls">
            <div className="sort-controls">
              <label htmlFor="sort-select">{t('sortBy') || 'Sort by'}:</label>
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">{t('newest') || 'Newest'}</option>
                <option value="oldest">{t('oldest') || 'Oldest'}</option>
                <option value="highest">{t('highestRated') || 'Highest Rated'}</option>
                <option value="lowest">{t('lowestRated') || 'Lowest Rated'}</option>
              </select>
            </div>
          </div>

          <div className="reviews-list">
            {sortedReviews.map(renderReviewItem)}
          </div>
        </>
      ) : (
        <div className="no-reviews">
          <div className="no-reviews-icon">📝</div>
          <h4>{t('noReviewsYet') || 'No reviews yet'}</h4>
          <p>{t('beFirstToReview') || 'Be the first to review this book!'}</p>
        </div>
      )}
    </div>
  );
};

export default BookReviews;
