import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  toggleNotificationStatus,
  getNotificationStats
} from '../../services/notificationService';
import { getAuthHeaders } from '../../utils/adminAuth';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [stats, setStats] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    message: '',
    messageAr: '',
    type: 'promotion',
    priority: 'medium',
    targetUsers: 'all',
    specificUsers: [],
    targetRoles: [],
    promotionData: {
      discountPercentage: '',
      discountAmount: '',
      minimumOrder: 0,
      promoCode: '',
      maxUses: 1000,
      validUntil: ''
    },
    actionUrl: '',
    actionText: '',
    actionTextAr: '',
    imageUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getAllNotifications();
      setNotifications(response.data.doc || response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getNotificationStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('promotionData.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        promotionData: {
          ...prev.promotionData,
          [field]: type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare data for submission
      const submitData = { ...formData };
      
      // Clean up promotion data if not a promotion/discount type
      if (submitData.type !== 'promotion' && submitData.type !== 'discount') {
        delete submitData.promotionData;
      } else {
        // Clean empty promotion fields
        Object.keys(submitData.promotionData).forEach(key => {
          if (submitData.promotionData[key] === '' || submitData.promotionData[key] === null) {
            delete submitData.promotionData[key];
          }
        });
      }

      if (editingNotification) {
        await updateNotification(editingNotification._id, submitData);
      } else {
        await createNotification(submitData);
      }

      // Reset form and reload data
      resetForm();
      loadNotifications();
      loadStats();
      
    } catch (error) {
      console.error('Error saving notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title || '',
      titleAr: notification.titleAr || '',
      message: notification.message || '',
      messageAr: notification.messageAr || '',
      type: notification.type || 'promotion',
      priority: notification.priority || 'medium',
      targetUsers: notification.targetUsers || 'all',
      specificUsers: notification.specificUsers || [],
      targetRoles: notification.targetRoles || [],
      promotionData: {
        discountPercentage: notification.promotionData?.discountPercentage || '',
        discountAmount: notification.promotionData?.discountAmount || '',
        minimumOrder: notification.promotionData?.minimumOrder || 0,
        promoCode: notification.promotionData?.promoCode || '',
        maxUses: notification.promotionData?.maxUses || 1000,
        validUntil: notification.promotionData?.validUntil 
          ? new Date(notification.promotionData.validUntil).toISOString().split('T')[0] 
          : ''
      },
      actionUrl: notification.actionUrl || '',
      actionText: notification.actionText || '',
      actionTextAr: notification.actionTextAr || '',
      imageUrl: notification.imageUrl || '',
      startDate: notification.startDate 
        ? new Date(notification.startDate).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      endDate: notification.endDate 
        ? new Date(notification.endDate).toISOString().split('T')[0] 
        : ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm(t('confirmDeleteNotification'))) {
      try {
        await deleteNotification(notificationId);
        loadNotifications();
        loadStats();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleToggleStatus = async (notificationId) => {
    try {
      await toggleNotificationStatus(notificationId);
      loadNotifications();
      loadStats();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      message: '',
      messageAr: '',
      type: 'promotion',
      priority: 'medium',
      targetUsers: 'all',
      specificUsers: [],
      targetRoles: [],
      promotionData: {
        discountPercentage: '',
        discountAmount: '',
        minimumOrder: 0,
        promoCode: '',
        maxUses: 1000,
        validUntil: ''
      },
      actionUrl: '',
      actionText: '',
      actionTextAr: '',
      imageUrl: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setEditingNotification(null);
    setShowCreateForm(false);
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && notification.isActive) ||
      (filterStatus === 'inactive' && !notification.isActive) ||
      (filterStatus === 'expired' && notification.endDate && new Date(notification.endDate) < new Date());
    
    const matchesSearch = searchTerm === '' ||
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.messageAr?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const formatDate = (date) => {
    const locale = isRTL ? 'ar-EG' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className={`admin-notifications ${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1>
            <span className="icon">🔔</span>
            {t('notifications')} & {t('promotions')}
          </h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? t('cancel') : t('createPromotion')}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.summary?.total || 0}</div>
              <div className="stat-label">{t('totalNotifications')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.summary?.active || 0}</div>
              <div className="stat-label">{t('activeNotifications')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.summary?.expired || 0}</div>
              <div className="stat-label">{t('expiredNotifications')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="form-section">
          <h2>{editingNotification ? t('editPromotion') : t('createPromotion')}</h2>
          <form onSubmit={handleSubmit} className="notification-form">
            <div className="form-row">
              <div className="form-group">
                <label>{t('promotionTitle')} (English)</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter promotion title in English"
                />
              </div>
              <div className="form-group">
                <label>{t('promotionTitle')} (العربية)</label>
                <input
                  type="text"
                  name="titleAr"
                  value={formData.titleAr}
                  onChange={handleInputChange}
                  placeholder="أدخل عنوان العرض باللغة العربية"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('promotionMessage')} (English)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Enter promotion message in English"
                />
              </div>
              <div className="form-group">
                <label>{t('promotionMessage')} (العربية)</label>
                <textarea
                  name="messageAr"
                  value={formData.messageAr}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="أدخل رسالة العرض باللغة العربية"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('type')}</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="promotion">{t('promotion')}</option>
                  <option value="discount">{t('discount')}</option>
                  <option value="general">{t('general')}</option>
                  <option value="order">{t('order')}</option>
                  <option value="system">{t('system')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('priority')}</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">{t('low')}</option>
                  <option value="medium">{t('medium')}</option>
                  <option value="high">{t('high')}</option>
                  <option value="urgent">{t('urgent')}</option>
                </select>
              </div>
            </div>

            {/* Promotion-specific fields */}
            {(formData.type === 'promotion' || formData.type === 'discount') && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('discountPercentage')} (%)</label>
                    <input
                      type="number"
                      name="promotionData.discountPercentage"
                      value={formData.promotionData.discountPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('discountAmount')} ($)</label>
                    <input
                      type="number"
                      name="promotionData.discountAmount"
                      value={formData.promotionData.discountAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="e.g., 10.00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('promoCodeOptional')}</label>
                    <input
                      type="text"
                      name="promotionData.promoCode"
                      value={formData.promotionData.promoCode}
                      onChange={handleInputChange}
                      placeholder="e.g., SAVE25"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('minimumOrder')} ($)</label>
                    <input
                      type="number"
                      name="promotionData.minimumOrder"
                      value={formData.promotionData.minimumOrder}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('maxUses')}</label>
                    <input
                      type="number"
                      name="promotionData.maxUses"
                      value={formData.promotionData.maxUses}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('validUntil')}</label>
                    <input
                      type="date"
                      name="promotionData.validUntil"
                      value={formData.promotionData.validUntil}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>{t('targetAudience')}</label>
                <select
                  name="targetUsers"
                  value={formData.targetUsers}
                  onChange={handleInputChange}
                >
                  <option value="all">{t('allUsers')}</option>
                  <option value="role-based">{t('roleBased')}</option>
                </select>
              </div>
              {formData.targetUsers === 'role-based' && (
                <div className="form-group">
                  <label>{t('targetRoles')}</label>
                  <select
                    multiple
                    name="targetRoles"
                    value={formData.targetRoles}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData(prev => ({ ...prev, targetRoles: values }));
                    }}
                  >
                    <option value="USER">{t('user')}</option>
                    <option value="ADMIN">{t('adminRole')}</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('actionUrl')} (Optional)</label>
                <input
                  type="url"
                  name="actionUrl"
                  value={formData.actionUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/promotions"
                />
              </div>
              <div className="form-group">
                <label>{t('imageUrl')} (Optional)</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? t('saving') : (editingNotification ? t('updatePromotion') : t('savePromotion'))}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>{t('filterByType')}</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">{t('allTypes')}</option>
              <option value="promotion">{t('promotion')}</option>
              <option value="discount">{t('discount')}</option>
              <option value="general">{t('general')}</option>
              <option value="order">{t('order')}</option>
              <option value="system">{t('system')}</option>
            </select>
          </div>

          <div className="filter-group">
            <label>{t('filterByStatus')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
              <option value="expired">{t('expired')}</option>
            </select>
          </div>

          <div className="filter-group">
            <label>{t('search')}</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchNotifications')}
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {loading && !notifications.length ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('loadingNotifications')}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔔</span>
            <h3>{t('noNotificationsFound')}</h3>
            <p>{t('createFirstNotification')}</p>
          </div>
        ) : (
          <div className="notifications-grid">
            {filteredNotifications.map(notification => (
              <div key={notification._id} className="notification-card">
                <div className="card-header">
                  <div className="notification-meta">
                    <span className="type-icon">{getTypeIcon(notification.type)}</span>
                    <span className="type-label">{t(notification.type)}</span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    >
                      {t(notification.priority)}
                    </span>
                  </div>
                  <div className="status-indicator">
                    <span className={`status ${notification.isActive ? 'active' : 'inactive'}`}>
                      {notification.isActive ? t('active') : t('inactive')}
                    </span>
                    {notification.endDate && new Date(notification.endDate) < new Date() && (
                      <span className="expired-badge">{t('expired')}</span>
                    )}
                  </div>
                </div>

                <div className="card-content">
                  <h4 className="notification-title">
                    {isRTL && notification.titleAr ? notification.titleAr : notification.title}
                  </h4>
                  <p className="notification-message">
                    {isRTL && notification.messageAr ? notification.messageAr : notification.message}
                  </p>

                  {/* Promotion details */}
                  {(notification.type === 'promotion' || notification.type === 'discount') && 
                   notification.promotionData && (
                    <div className="promotion-preview">
                      {notification.promotionData.discountPercentage && (
                        <span className="discount-info">
                          {notification.promotionData.discountPercentage}% {t('off')}
                        </span>
                      )}
                      {notification.promotionData.discountAmount && (
                        <span className="discount-info">
                          ${notification.promotionData.discountAmount} {t('off')}
                        </span>
                      )}
                      {notification.promotionData.promoCode && (
                        <span className="promo-code-info">
                          {t('code')}: {notification.promotionData.promoCode}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="notification-dates">
                    <small>{t('created')}: {formatDate(notification.createdAt)}</small>
                    {notification.endDate && (
                      <small>{t('expires')}: {formatDate(notification.endDate)}</small>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEdit(notification)}
                    title={t('editNotification')}
                  >
                    ✏️ {t('edit')}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleToggleStatus(notification._id)}
                    title={t('toggleStatus')}
                  >
                    {notification.isActive ? '⏸️' : '▶️'}
                    {notification.isActive ? t('deactivate') : t('activate')}
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(notification._id)}
                    title={t('deleteNotification')}
                  >
                    🗑️ {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
