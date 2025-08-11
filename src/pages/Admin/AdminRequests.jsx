import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { getAuthHeaders } from '../../utils/adminAuth';
import axios from 'axios';
import './AdminRequests.css';
import { useTranslation } from 'react-i18next';

const AdminRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch requests on component mount
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const response = await axios.get(API_ENDPOINTS.CONTACT, { headers });
      console.log('Requests API Response:', response.data); // Debug log
      setRequests(response.data.doc || []);
      setError(null);
    } catch (err) {
      setError(t('failedLoadRequests'));
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm(t('confirmDeleteRequest'))) {
      return;
    }

    try {
      setUpdating(true);
      const headers = getAuthHeaders();

      await axios.delete(`${API_ENDPOINTS.CONTACT}/${requestId}`, { headers });
      
      setRequests(requests.filter(request => request._id !== requestId));
      setSelectedRequest(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || t('failedDeleteRequest'));
      console.error('Error deleting request:', err);
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

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) return t('justNow');
    if (diffInHours < 24) return t('hoursAgo', { hours: diffInHours });
    if (diffInDays === 1) return t('yesterday');
    if (diffInDays < 7) return t('daysAgo', { days: diffInDays });
    if (diffInDays < 30) return t('weeksAgo', { weeks: Math.floor(diffInDays / 7) });
    return t('monthsAgo', { months: Math.floor(diffInDays / 30) });
  };

  const filteredRequests = requests.filter(request => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.name?.toLowerCase().includes(searchLower) ||
      request.email?.toLowerCase().includes(searchLower) ||
      request.message?.toLowerCase().includes(searchLower)
    );
  });

  const getRequestStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: requests.length,
      today: requests.filter(r => new Date(r.createdAt) >= today).length,
      thisWeek: requests.filter(r => new Date(r.createdAt) >= thisWeek).length,
      thisMonth: requests.filter(r => new Date(r.createdAt) >= thisMonth).length,
      unread: requests.length // All are considered unread since we don't have a read status
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="admin-requests-loading">
        <div className="loading-spinner"></div>
        <p>{t('loadingRequests')}</p>
      </div>
    );
  }

  const stats = getRequestStats();

  return (
    <div className="admin-requests">
      <div className="admin-requests-header">
        <h1>{t('manageRequests')}</h1>
        <div className="requests-stats">
          <div className="stat-card main">
            <h3>{stats.total}</h3>
            <p>{t('totalRequests')}</p>
          </div>
          <div className="stat-card today">
            <h3>{stats.today}</h3>
            <p>{t('today')}</p>
          </div>
          <div className="stat-card week">
            <h3>{stats.thisWeek}</h3>
            <p>{t('thisWeek')}</p>
          </div>
          <div className="stat-card month">
            <h3>{stats.thisMonth}</h3>
            <p>{t('thisMonth')}</p>
          </div>
          <div className="stat-card unread">
            <h3>{stats.unread}</h3>
            <p>{t('pendingRequests')}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="requests-controls">
        <div className="search-section">
          <label htmlFor="requestSearch">{t('searchRequests')}:</label>
          <input
            id="requestSearch"
            type="text"
            placeholder={t('searchByNameEmailMessage')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          className="btn btn-secondary"
          onClick={loadRequests}
          disabled={loading}
        >
          🔄 {t('refresh')}
        </button>
      </div>

      <div className="requests-content">
        <div className="requests-list">
          <h2>{t('contactRequests')} ({filteredRequests.length})</h2>
          
          {filteredRequests.length === 0 ? (
            <div className="no-requests">
              <p>{t('noRequestsFound')}</p>
            </div>
          ) : (
            <div className="requests-grid">
              {filteredRequests.map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-header">
                    <div className="contact-info">
                      <div className="contact-avatar">
                        {request.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="contact-details">
                        <strong>{request.name || t('unknown')}</strong>
                        <small>{request.email || t('noEmail')}</small>
                      </div>
                    </div>
                    <div className="request-time">
                      <small>{getTimeAgo(request.createdAt)}</small>
                    </div>
                  </div>
                  
                  <div className="request-content">
                    <p className="request-message">
                      "{request.message?.length > 100 
                        ? `${request.message.substring(0, 100)}...`
                        : request.message || t('noMessage')
                      }"
                    </p>
                    <div className="request-date">
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                  
                  <div className="request-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setSelectedRequest(request)}
                      title={t('viewFullRequest')}
                    >
                      👁️ {t('view')}
                    </button>
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => window.open(`mailto:${request.email}?subject=Re: Your Contact Request`)}
                      title={t('replyViaEmail')}
                    >
                      📧 {t('reply')}
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteRequest(request._id)}
                      disabled={updating}
                      title={t('deleteRequestPermanently')}
                    >
                      🗑️ {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="request-modal-overlay" onClick={() => setSelectedRequest(null)}>
            <div className="request-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{t('requestDetails')}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedRequest(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="request-details">
                  <div className="contact-section">
                    <h3>{t('contactInformation')}</h3>
                    <div className="contact-avatar-large">
                      {selectedRequest.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="contact-info-detailed">
                      <p><strong>{t('name')}:</strong> {selectedRequest.name || t('unknown')}</p>
                      <p><strong>{t('email')}:</strong> {selectedRequest.email || t('noEmail')}</p>
                      <p><strong>{t('submitted')}:</strong> {formatDate(selectedRequest.createdAt)}</p>
                      <p><strong>{t('timeAgo')}:</strong> {getTimeAgo(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="message-section">
                    <h3>{t('message')}</h3>
                    <div className="message-content">
                      <p>"{selectedRequest.message || t('noMessageProvided')}"</p>
                    </div>
                  </div>
                  
                  <div className="metadata-section">
                    <h3>{t('requestInformation')}</h3>
                    <p><strong>{t('requestID')}:</strong> {selectedRequest._id}</p>
                    <p><strong>{t('status')}:</strong> <span className="status-pending">{t('pendingRequests')}</span></p>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => window.open(`mailto:${selectedRequest.email}?subject=Re: Your Contact Request&body=Dear ${selectedRequest.name},%0D%0A%0D%0AThank you for contacting us. Regarding your message:%0D%0A"${selectedRequest.message}"%0D%0A%0D%0ABest regards,%0D%0AThe Team`)}
                  >
                    📧 {t('replyViaEmail')}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      handleDeleteRequest(selectedRequest._id);
                      setSelectedRequest(null);
                    }}
                    disabled={updating}
                  >
                    🗑️ {t('deleteRequest')}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedRequest(null)}
                  >
                    {t('close')}
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

export default AdminRequests;
