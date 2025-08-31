import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PromotionService from '../../services/promotionService';
import './AdminPromotions.css';

const AdminPromotions = () => {
  const { t, i18n } = useTranslation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    isActive: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'special_campaign',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    promoCode: '',
    autoApply: false,
    minOrderAmount: '',
    maxUsagePerUser: '1',
    totalUsageLimit: '',
    targetAudience: 'all',
    loyaltyTierRequired: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchPromotions();
    fetchAnalytics();
  }, [filters, currentPage]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      
      const response = await PromotionService.getAllPromotions(queryParams);
      
      // Handle nested response structure - API returns data.data.promotions
      const promotionsData = response.data?.data?.promotions || response.data?.promotions || [];
      
      setPromotions(promotionsData);
      setTotalPages(response.data?.totalPages || response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await PromotionService.getPromotionAnalytics();
      setAnalytics(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPromotion) {
        await PromotionService.updatePromotion(editingPromotion._id, formData);
      } else {
        await PromotionService.createPromotion(formData);
      }
      
      resetForm();
      fetchPromotions();
      fetchAnalytics();
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert(error.response?.data?.message || t('errorSavingPromotion'));
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      maxDiscountAmount: promotion.maxDiscountAmount || '',
      promoCode: promotion.promoCode || '',
      autoApply: promotion.autoApply,
      minOrderAmount: promotion.minOrderAmount,
      maxUsagePerUser: promotion.maxUsagePerUser,
      totalUsageLimit: promotion.totalUsageLimit || '',
      targetAudience: promotion.targetAudience,
      loyaltyTierRequired: promotion.loyaltyTierRequired || '',
      startDate: new Date(promotion.startDate).toISOString().slice(0, 16),
      endDate: new Date(promotion.endDate).toISOString().slice(0, 16),
      isActive: promotion.isActive
    });
    setShowForm(true);
    
    // Scroll to the form section to show the edit form
    setTimeout(() => {
      const formSection = document.getElementById('promotion-form-section');
      if (formSection) {
        formSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // Fallback to scroll to top if form section not found
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 150); // Small delay to ensure form is rendered and DOM is updated
  };

  const handleDelete = async (promotionId) => {
    if (window.confirm(t('confirmDeletePromotion'))) {
      try {
        await PromotionService.deletePromotion(promotionId);
        fetchPromotions();
        fetchAnalytics();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        alert(error.response?.data?.message || t('errorDeletingPromotion'));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'special_campaign',
      discountType: 'percentage',
      discountValue: '',
      maxDiscountAmount: '',
      promoCode: '',
      autoApply: false,
      minOrderAmount: '',
      maxUsagePerUser: '1',
      totalUsageLimit: '',
      targetAudience: 'all',
      loyaltyTierRequired: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setEditingPromotion(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && promotions.length === 0) {
    return (
      <div className="admin-promotions-loading">
        <div className="loading-spinner"></div>
        <p>{t('loadingPromotions')}</p>
      </div>
    );
  }

  return (
    <div className={`admin-promotions ${i18n.dir()}`}>
      <div className="admin-promotions-header">
        <h1>{t('promotionsManagement')}</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? t('cancel') : t('createNewPromotion')}
        </button>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="analytics-dashboard">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{analytics.overview.totalPromotions}</h3>
                <p>{t('totalPromotions')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{analytics.overview.activePromotions}</h3>
                <p>{t('activePromotions')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>{analytics.overview.totalUsage}</h3>
                <p>{t('totalUsage')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{formatCurrency(analytics.overview.totalRevenue)}</h3>
                <p>{t('totalRevenue')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💸</div>
              <div className="stat-content">
                <h3>{formatCurrency(analytics.overview.totalDiscount)}</h3>
                <p>{t('totalDiscountGiven')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div id="promotion-form-section" className="promotion-form-section">
          <h2>{editingPromotion ? t('editPromotion') : t('createNewPromotion')}</h2>
          <form onSubmit={handleSubmit} className="promotion-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">{t('promotionName')} *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t('enterPromotionName')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">{t('promotionType')}</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="first_time_buyer">{t('firstTimeBuyer')}</option>
                  <option value="loyalty_tier">{t('loyaltyTier')}</option>
                  <option value="special_campaign">{t('specialCampaign')}</option>
                  <option value="seasonal">{t('seasonal')}</option>
                  <option value="bulk_discount">{t('bulkDiscount')}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">{t('description')} *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder={t('enterPromotionDescription')}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="discountType">{t('discountType')}</label>
                <select
                  id="discountType"
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                >
                  <option value="percentage">{t('percentage')}</option>
                  <option value="fixed_amount">{t('fixedAmount')}</option>
                  <option value="free_shipping">{t('freeShipping')}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="discountValue">
                  {formData.discountType === 'percentage' ? t('discountPercentage') : t('discountAmount')} *
                </label>
                <input
                  type="number"
                  id="discountValue"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                />
              </div>
            </div>

            {formData.discountType === 'percentage' && (
              <div className="form-group">
                <label htmlFor="maxDiscountAmount">{t('maxDiscountAmount')}</label>
                <input
                  type="number"
                  id="maxDiscountAmount"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder={t('optionalMaxCap')}
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="promoCode">{t('promoCode')}</label>
                <input
                  type="text"
                  id="promoCode"
                  name="promoCode"
                  value={formData.promoCode}
                  onChange={handleInputChange}
                  placeholder={t('leaveEmptyForAuto')}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="autoApply"
                    checked={formData.autoApply}
                    onChange={handleInputChange}
                  />
                  {t('autoApply')}
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minOrderAmount">{t('minimumOrderAmount')}</label>
                <input
                  type="number"
                  id="minOrderAmount"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="maxUsagePerUser">{t('maxUsagePerUser')}</label>
                <input
                  type="number"
                  id="maxUsagePerUser"
                  name="maxUsagePerUser"
                  value={formData.maxUsagePerUser}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="totalUsageLimit">{t('totalUsageLimit')}</label>
                <input
                  type="number"
                  id="totalUsageLimit"
                  name="totalUsageLimit"
                  value={formData.totalUsageLimit}
                  onChange={handleInputChange}
                  min="1"
                  placeholder={t('leaveEmptyForUnlimited')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="targetAudience">{t('targetAudience')}</label>
                <select
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                >
                  <option value="all">{t('allCustomers')}</option>
                  <option value="new_customers">{t('newCustomers')}</option>
                  <option value="returning_customers">{t('returningCustomers')}</option>
                  <option value="loyalty_tier">{t('loyaltyTierCustomers')}</option>
                </select>
              </div>
            </div>

            {formData.targetAudience === 'loyalty_tier' && (
              <div className="form-group">
                <label htmlFor="loyaltyTierRequired">{t('requiredLoyaltyTier')}</label>
                <select
                  id="loyaltyTierRequired"
                  name="loyaltyTierRequired"
                  value={formData.loyaltyTierRequired}
                  onChange={handleInputChange}
                >
                  <option value="">{t('selectTier')}</option>
                  <option value="bronze">{t('bronze')}</option>
                  <option value="silver">{t('silver')}</option>
                  <option value="gold">{t('gold')}</option>
                  <option value="platinum">{t('platinum')}</option>
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">{t('startDate')} *</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">{t('endDate')} *</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                {t('activePromotion')}
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingPromotion ? t('updatePromotion') : t('createPromotion')}
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
            <label htmlFor="typeFilter">{t('filterByType')}:</label>
            <select
              id="typeFilter"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">{t('allTypes')}</option>
              <option value="first_time_buyer">{t('firstTimeBuyer')}</option>
              <option value="loyalty_tier">{t('loyaltyTier')}</option>
              <option value="special_campaign">{t('specialCampaign')}</option>
              <option value="seasonal">{t('seasonal')}</option>
              <option value="bulk_discount">{t('bulkDiscount')}</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="statusFilter">{t('filterByStatus')}:</label>
            <select
              id="statusFilter"
              name="isActive"
              value={filters.isActive}
              onChange={handleFilterChange}
            >
              <option value="">{t('allStatuses')}</option>
              <option value="true">{t('active')}</option>
              <option value="false">{t('inactive')}</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="searchFilter">{t('search')}:</label>
            <input
              type="text"
              id="searchFilter"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder={t('searchPromotions')}
            />
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="promotions-table-section">
        <h2>{t('allPromotions')} ({promotions.length})</h2>
        
        {promotions.length === 0 ? (
          <div className="no-promotions">
            <p>{t('noPromotionsFound')}</p>
          </div>
        ) : (
          <div className="promotions-table">
            <table>
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('type')}</th>
                  <th>{t('discount')}</th>
                  <th>{t('code')}</th>
                  <th>{t('usage')}</th>
                  <th>{t('dates')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion._id}>
                    <td className="promotion-name">
                      <div>
                        <strong>{promotion.name}</strong>
                        <small>{promotion.description}</small>
                      </div>
                    </td>
                    <td className="promotion-type">
                      <span className={`type-badge ${promotion.type}`}>
                        {t(promotion.type)}
                      </span>
                    </td>
                    <td className="promotion-discount">
                      {PromotionService.formatDiscountDisplay(
                        promotion.discountType,
                        promotion.discountValue,
                        promotion.maxDiscountAmount
                      )}
                    </td>
                    <td className="promotion-code">
                      {promotion.promoCode ? (
                        <code>{promotion.promoCode}</code>
                      ) : (
                        <span className="auto-apply">{t('autoApply')}</span>
                      )}
                    </td>
                    <td className="promotion-usage">
                      <div className="usage-stats">
                        <span>{promotion.currentUsageCount}</span>
                        {promotion.totalUsageLimit && (
                          <span>/ {promotion.totalUsageLimit}</span>
                        )}
                      </div>
                    </td>
                    <td className="promotion-dates">
                      <div>
                        <small>{formatDate(promotion.startDate)}</small>
                        <small>{formatDate(promotion.endDate)}</small>
                      </div>
                    </td>
                    <td className="promotion-status">
                      <span className={`status-badge ${promotion.isActive ? 'active' : 'inactive'}`}>
                        {promotion.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="promotion-actions">
                      <button 
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(promotion)}
                        title={t('editPromotion')}
                      >
                        {t('edit')}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(promotion._id)}
                        title={t('deletePromotion')}
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              {t('previous')}
            </button>
            
            <span className="pagination-info">
              {t('page')} {currentPage} {t('of')} {totalPages}
            </span>
            
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotions;
