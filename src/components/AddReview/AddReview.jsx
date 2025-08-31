import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReviewStars from '../ReviewStars/ReviewStars';
import { addProductReview } from '../../services/reviewService';
import './AddReview.css';

const AddReview = ({ productId, onReviewAdded, onCancel }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError(t('pleaseSelectRating') || 'Please select a rating');
      return;
    }
    
    if (!message.trim()) {
      setError(t('pleaseEnterReviewMessage') || 'Please enter a review message');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const reviewData = {
        rate: rating,
        message: message.trim()
      };
      
      const newReview = await addProductReview(productId, reviewData);
      
      // Reset form
      setRating(0);
      setMessage('');
      
      // Notify parent component
      if (onReviewAdded) {
        onReviewAdded(newReview);
      }
      
    } catch (err) {
      setError(err.message || t('failedAddReview') || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-review">
      <h3 className="add-review-title">
        {t('writeReview') || 'Write a Review'}
      </h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="add-review-form">
        <div className="rating-section">
          <label className="rating-label">
            {t('yourRating') || 'Your Rating'} *
          </label>
          <ReviewStars
            rating={rating}
            interactive={true}
            onRatingChange={setRating}
            size="large"
          />
          {rating > 0 && (
            <span className="rating-text">
              {rating} {t('outOfFiveStars') || 'out of 5 stars'}
            </span>
          )}
        </div>
        
        <div className="message-section">
          <label htmlFor="review-message" className="message-label">
            {t('reviewMessage') || 'Your Review'} *
          </label>
          <textarea
            id="review-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('writeDetailedReview') || 'Share your thoughts about this book...'}
            rows="5"
            maxLength="500"
            className="review-textarea"
            disabled={submitting}
          />
          <div className="character-count">
            {message.length}/500
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={submitting}
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || rating === 0}
          >
            {submitting 
              ? (t('submittingReview') || 'Submitting...') 
              : (t('submitReview') || 'Submit Review')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReview;
