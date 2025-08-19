import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { getAuthHeaders } from '../../utils/adminAuth';
import { getProductImageUrl } from '../../utils/imageUtils';
import axios from 'axios';
import './AdminInventory.css';
import { useTranslation } from 'react-i18next';

const AdminInventory = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const [statsResponse, lowStockResponse, outOfStockResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.INVENTORY_STATS, { headers }),
        axios.get(API_ENDPOINTS.LOW_STOCK_PRODUCTS, { headers }),
        axios.get(API_ENDPOINTS.OUT_OF_STOCK_PRODUCTS, { headers })
      ]);

      setStats(statsResponse.data.data.stats);
      setLowStockProducts(lowStockResponse.data.data.products);
      setOutOfStockProducts(outOfStockResponse.data.data.products);
      setError(null);
    } catch (err) {
      setError(t('failedLoadData'));
      console.error('Error loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newStock) => {
    try {
      setUpdating(true);
      const headers = getAuthHeaders();

      const response = await axios.patch(
        API_ENDPOINTS.UPDATE_STOCK(productId),
        { stock: newStock },
        { headers }
      );

      // Immediately update the local state to reflect changes
      const updatedProduct = response.data.data.product;
      
      // Update low stock products list
      setLowStockProducts(prev => 
        prev.map(product => 
          product._id === productId 
            ? { ...product, stock: updatedProduct.stock }
            : product
        ).filter(product => 
          // Remove from low stock if now above minimum level
          product.stock > product.minStockLevel
        )
      );

      // Update out of stock products list
      setOutOfStockProducts(prev => 
        prev.filter(product => product._id !== productId) // Remove from out of stock
      );

      // Reload full data to get accurate stats
      await loadInventoryData();
      
      // Show success message with details
      const stockStatus = updatedProduct.stock > updatedProduct.minStockLevel 
        ? t('sufficientStock') 
        : t('stillLowStock');
      alert(t('stockUpdatedSuccessfully', { stock: updatedProduct.stock, status: stockStatus }));
      
    } catch (err) {
      setError(err.response?.data?.message || t('failedToUpdateStock'));
      console.error('Error updating stock:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStockStatus = (current, minimum) => {
    if (current === 0) return 'out-of-stock';
    if (current <= minimum) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusText = (current, minimum) => {
    if (current === 0) return t('outOfStock');
    if (current <= minimum) return t('lowStock');
    return t('inStock');
  };

  // Helper function to get the correct image URL
  const getImageSrc = (imageValue) => {
    return getProductImageUrl({ image: imageValue });
  };

  // Function to translate category names
  const translateCategoryName = (name) => {
    const categoryTranslations = {
      'Fiction': t('categoryFiction'),
      'Science Fiction': t('categoryScienceFiction'),
      'Biography': t('categoryBiography'),
      'History': t('categoryHistory'),
      'Romance': t('categoryRomance'),
      'Mystery': t('categoryMystery'),
      'Thriller': t('categoryThriller'),
      'Fantasy': t('categoryFantasy'),
      'Horror': t('categoryHorror'),
      'Self Help': t('categorySelfHelp'),
      'Business': t('categoryBusiness'),
      'Technology': t('categoryTechnology'),
      'Children': t('categoryChildren'),
      'Education': t('categoryEducation'),
      'Travel': t('categoryTravel')
    };
    return categoryTranslations[name] || name;
  };

  if (loading) {
    return (
      <div className="admin-inventory-loading">
        <div className="loading-spinner"></div>
        <p>{t('loading')}...</p>
      </div>
    );
  }

  return (
    <div className="admin-inventory">
      <div className="admin-inventory-header">
        <h1>📦 {t('inventoryManagement')}</h1>
        <button 
          className="btn btn-primary"
          onClick={loadInventoryData}
          disabled={updating}
        >
          🔄 {t('refreshData')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="inventory-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 {t('overview')}
        </button>
        <button 
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          ⚠️ {t('stockAlerts')} ({lowStockProducts.length + outOfStockProducts.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card total-products">
              <div className="stat-icon">
                <i className="fas fa-boxes"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.totalProducts || 0}</h3>
                <p>{t('totalProducts')}</p>
              </div>
            </div>

            <div className="stat-card total-stock">
              <div className="stat-icon">
                <i className="fas fa-layer-group"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.totalStockQuantity || 0}</h3>
                <p>{t('totalStockQuantity')}</p>
              </div>
            </div>

            <div className="stat-card in-stock">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.inStockProducts || 0}</h3>
                <p>{t('productsInStock')}</p>
              </div>
            </div>

            <div className="stat-card low-stock">
              <div className="stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.lowStock || 0}</h3>
                <p>{t('lowStock')}</p>
              </div>
            </div>

            <div className="stat-card out-of-stock">
              <div className="stat-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.outOfStock || 0}</h3>
                <p>{t('outOfStock')}</p>
              </div>
            </div>

            <div className="stat-card inventory-value">
              <div className="stat-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.totalInventoryValue || 0)}</h3>
                <p>{t('totalInventoryValue')}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>🚀 {t('quickActions')}</h2>
            <div className="action-buttons">
              <button 
                className="action-btn"
                onClick={() => setActiveTab('alerts')}
                disabled={lowStockProducts.length + outOfStockProducts.length === 0}
              >
                📢 {t('viewStockAlerts')}
              </button>
              <button 
                className="action-btn"
                onClick={loadInventoryData}
                disabled={updating}
              >
                🔄 {t('refreshInventory')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="alerts-section">
          {/* Out of Stock Products */}
          {outOfStockProducts.length > 0 && (
            <div className="alert-group">
              <h2 className="alert-title out-of-stock">
                🚨 {t('outOfStockProducts')} ({outOfStockProducts.length})
              </h2>
              <div className="alert-products">
                {outOfStockProducts.map(product => (
                  <div key={product._id} className="alert-card out-of-stock">
                    <div className="product-info">
                      <img 
                        src={getProductImageUrl({ image: product.image })} 
                        alt={product.name}
                        className="product-image"
                      />
                      <div className="product-details">
                        <h3>{product.name}</h3>
                        <p className="category">{t('category')}: {translateCategoryName(product.categoryId?.name)}</p>
                        <p className="price">{t('price')}: {formatCurrency(product.price)}</p>
                        <p className="publisher">{t('publisher')}: {product.publisherEmail}</p>
                      </div>
                    </div>
                    <div className="stock-controls">
                      <span className="current-stock">{t('stock')}: {product.stock}</span>
                      <div className="stock-input">
                        <input 
                          type="number"
                          min={1}
                          placeholder={t('updateStock')}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const newStock = parseInt(e.target.value);
                              if (newStock > product.stock) {
                                updateStock(product._id, newStock);
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <button 
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            const newStock = parseInt(input.value);
                            if (newStock > product.stock) {
                              updateStock(product._id, newStock);
                              input.value = '';
                            }
                          }}
                          disabled={updating}
                        >
                          {t('updateStock')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Products */}
          {lowStockProducts.length > 0 && (
            <div className="alert-group">
              <h2 className="alert-title low-stock">
                ⚠️ {t('lowStockProducts')} ({lowStockProducts.length})
              </h2>
              <div className="alert-products">
                {lowStockProducts.map(product => (
                  <div key={product._id} className="alert-card low-stock">
                    <div className="product-info">
                      <img 
                        src={getProductImageUrl({ image: product.image })} 
                        alt={product.name}
                        className="product-image"
                      />
                      <div className="product-details">
                        <h3>{product.name}</h3>
                        <p className="category">{t('category')}: {translateCategoryName(product.categoryId?.name)}</p>
                        <p className="price">{t('price')}: {formatCurrency(product.price)}</p>
                        <p className="publisher">{t('publisher')}: {product.publisherEmail}</p>
                      </div>
                    </div>
                    <div className="stock-controls">
                      <span className="current-stock">
                        {t('stock')}: {product.stock} / {t('minStockLevel')}: {product.minStockLevel}
                        <small className="stock-recommendation">
                          ({t('restockSuggestion')}: {product.minStockLevel + 5}+ {t('forGoodBuffer', 'for good buffer')})
                        </small>
                      </span>
                      <div className="stock-input">
                        <input 
                          type="number"
                          min={product.minStockLevel + 1}
                          placeholder={t('enterMinStockToResolve', { defaultValue: `${product.minStockLevel + 1}+` })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const newStock = parseInt(e.target.value);
                              if (newStock > product.stock) {
                                updateStock(product._id, newStock);
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <button 
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            const newStock = parseInt(input.value);
                            if (newStock > product.stock) {
                              updateStock(product._id, newStock);
                              input.value = '';
                            }
                          }}
                          disabled={updating}
                        >
                          {t('updateStock')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Alerts */}
          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
            <div className="no-alerts">
              <div className="no-alerts-icon">✅</div>
              <h2>{t('allGood')}</h2>
              <p>{t('noStockAlertsMessage')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
