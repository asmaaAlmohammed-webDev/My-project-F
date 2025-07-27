import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { getAuthHeaders } from '../../utils/adminAuth';
import axios from 'axios';
import './AdminReviews.css';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [updating, setUpdating] = useState(false);

  // Rating filter options
  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  // Fetch reviews on component mount
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const response = await axios.get(API_ENDPOINTS.REVIEWS, { headers });
      console.log('API Response:', response.data); // Debug log
      setReviews(response.data.doc || []);
      setError(null);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(true);
      const headers = getAuthHeaders();

      await axios.delete(`${API_ENDPOINTS.REVIEWS}/${reviewId}`, { headers });
      
      setReviews(reviews.filter(review => review._id !== reviewId));
      setSelectedReview(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
      console.error('Error deleting review:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  const getRatingColor = (rating) => {
    const colors = {
      5: '#27ae60',
      4: '#2ecc71',
      3: '#f39c12',
      2: '#e67e22',
      1: '#e74c3c'
    };
    return colors[rating] || '#95a5a6';
  };

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(review => review.rate.toString() === filterRating);

  const getReviewStats = () => {
    const stats = {
      total: reviews.length,
      avgRating: reviews.length > 0 
        ? (reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length).toFixed(1)
        : 0,
      breakdown: [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => r.rate === rating).length,
        percentage: reviews.length > 0 
          ? Math.round((reviews.filter(r => r.rate === rating).length / reviews.length) * 100)
          : 0
      }))
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="admin-reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  const stats = getReviewStats();

  return (
    <div className="admin-reviews">
      <div className="admin-reviews-header">
        <h1>Reviews Management</h1>
        <div className="reviews-stats">
          <div className="stat-card main">
            <h3>{stats.total}</h3>
            <p>Total Reviews</p>
          </div>
          <div className="stat-card rating">
            <h3>{stats.avgRating}</h3>
            <div className="stars-display">
              {renderStars(Math.round(stats.avgRating))}
            </div>
            <p>Average Rating</p>
          </div>
          {stats.breakdown.map(({ rating, count, percentage }) => (
            <div key={rating} className="stat-card breakdown">
              <div className="rating-info">
                <span className="rating-number">{rating}★</span>
                <span className="rating-count">{count}</span>
              </div>
              <div className="rating-bar">
                <div 
                  className="rating-fill"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: getRatingColor(rating)
                  }}
                ></div>
              </div>
              <p>{percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="reviews-controls">
        <div className="filter-section">
          <label htmlFor="ratingFilter">Filter by Rating:</label>
          <select
            id="ratingFilter"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="rating-filter"
          >
            {ratingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={loadReviews}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="reviews-content">
        <div className="reviews-list">
          <h2>Reviews ({filteredReviews.length})</h2>
          
          {filteredReviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews found.</p>
            </div>
          ) : (
            <div className="reviews-grid">
              {filteredReviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="customer-info">
                      <strong>{review.userId?.name || 'Anonymous'}</strong>
                      <small>{review.userId?.email || 'No email'}</small>
                    </div>
                    <div className="review-rating">
                      <div className="stars">
                        {renderStars(review.rate)}
                      </div>
                      <span className="rating-number">({review.rate}/5)</span>
                    </div>
                  </div>
                  
                  <div className="review-content">
                    <p className="review-message">"{review.message}"</p>
                    <div className="review-date">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                  
                  <div className="review-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setSelectedReview(review)}
                      title="View full review"
                    >
                      👁️ View
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteReview(review._id)}
                      disabled={updating}
                      title="Delete review permanently"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Details Modal */}
        {selectedReview && (
          <div className="review-modal-overlay" onClick={() => setSelectedReview(null)}>
            <div className="review-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Review Details</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedReview(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="review-details">
                  <div className="customer-section">
                    <h3>Customer Information</h3>
                    <div className="customer-details">
                      <p><strong>Name:</strong> {selectedReview.userId?.name || 'Anonymous'}</p>
                      <p><strong>Email:</strong> {selectedReview.userId?.email || 'No email'}</p>
                      <p><strong>Phone:</strong> {selectedReview.userId?.phone || 'No phone'}</p>
                    </div>
                  </div>
                  
                  <div className="rating-section">
                    <h3>Rating</h3>
                    <div className="rating-display">
                      <div className="large-stars">
                        {renderStars(selectedReview.rate)}
                      </div>
                      <span className="large-rating">
                        {selectedReview.rate} out of 5 stars
                      </span>
                    </div>
                  </div>
                  
                  <div className="message-section">
                    <h3>Review Message</h3>
                    <div className="message-content">
                      <p>"{selectedReview.message}"</p>
                    </div>
                  </div>
                  
                  <div className="metadata-section">
                    <h3>Review Information</h3>
                    <p><strong>Date:</strong> {formatDate(selectedReview.createdAt)}</p>
                    <p><strong>Review ID:</strong> {selectedReview._id}</p>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      handleDeleteReview(selectedReview._id);
                      setSelectedReview(null);
                    }}
                    disabled={updating}
                  >
                    🗑️ Delete Review
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedReview(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
