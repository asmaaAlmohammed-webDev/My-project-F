import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { getAuthHeaders } from '../../utils/adminAuth';
import axios from 'axios';
import './AdminOrders.css';
// ADDED: Translation hook
import { useTranslation } from 'react-i18next';

const AdminOrders = () => {
  // ADDED: Translation hook
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Order status options
  const statusOptions = [
    { value: 'all', label: t('allOrders') },
    { value: 'wating', label: t('waiting') },
    { value: 'preparing', label: t('preparing') },
    { value: 'dlivery', label: t('delivery') },
    { value: 'done', label: t('completed') }
  ];

  // Payment method labels
  const paymentMethods = {
    cash: t('cashOnDeliveryShort'),
    bank: t('bankTransferShort')
  };

  // Fetch orders from backend

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      wating: '#f39c12',
      preparing: '#3498db',
      dlivery: '#9b59b6',
      done: '#27ae60'
    };
    return colors[status] || '#95a5a6';
  };

  // Fetch orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const response = await axios.get(API_ENDPOINTS.ORDERS, { headers });
      console.log('Orders API Response:', response.data); // Debug log
      setOrders(response.data.doc || []);
      setError(null);
    } catch (err) {
      setError(t('failedLoadOrders'));
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const headers = getAuthHeaders();

      await axios.patch(
        `${API_ENDPOINTS.ORDERS}/${orderId}`,
        { status: newStatus },
        { headers }
      );

      // Update the order in state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || t('failedUpdateOrderStatus'));
      console.error('Error updating order:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(t('confirmDeleteOrder'))) {
      return;
    }

    try {
      const headers = getAuthHeaders();

      await axios.delete(`${API_ENDPOINTS.ORDERS}/${orderId}`, { headers });
      
      setOrders(orders.filter(order => order._id !== orderId));
      setSelectedOrder(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || t('failedDeleteOrder'));
      console.error('Error deleting order:', err);
    }
  };

  const formatDate = (dateString) => {
    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Translate status function
  const translateStatus = (status) => {
    const statusTranslations = {
      wating: t('waiting'),
      preparing: t('preparing'),
      dlivery: t('delivery'),
      done: t('completed')
    };
    return statusTranslations[status] || status;
  };

  const formatCurrency = (amount) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    const currency = i18n.language === 'ar' ? 'SAR' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      wating: orders.filter(o => o.status === 'wating').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      dlivery: orders.filter(o => o.status === 'dlivery').length,
      done: orders.filter(o => o.status === 'done').length,
      totalRevenue: orders
        .filter(o => o.status === 'done')
        .reduce((sum, o) => sum + o.total, 0)
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="admin-orders-loading">
        <div className="loading-spinner"></div>
        <p>{t('loadingOrders')}</p>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <h1>{t('manageOrders')}</h1>
        <div className="orders-stats">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>{t('totalOrders')}</p>
          </div>
          <div className="stat-card">
            <h3>{stats.wating}</h3>
            <p>{t('waiting')}</p>
          </div>
          <div className="stat-card">
            <h3>{stats.preparing}</h3>
            <p>{t('preparing')}</p>
          </div>
          <div className="stat-card">
            <h3>{stats.dlivery}</h3>
            <p>{t('delivery')}</p>
          </div>
          <div className="stat-card">
            <h3>{stats.done}</h3>
            <p>{t('completed')}</p>
          </div>
          <div className="stat-card revenue">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>{t('totalRevenue')}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="orders-controls">
        <div className="filter-section">
          <label htmlFor="statusFilter">{t('filterByStatus')}:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={loadOrders}
          disabled={loading}
        >
          🔄 {t('refresh')}
        </button>
      </div>

      <div className="orders-content">
        <div className="orders-list">
          <h2>{t('orders')} ({filteredOrders.length})</h2>
          
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>{t('noOrdersFound')}</p>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('orderID')}</th>
                    <th>{t('customer')}</th>
                    <th>{t('date')}</th>
                    <th>{t('items')}</th>
                    <th>{t('total')}</th>
                    <th>{t('payment')}</th>
                    <th>{t('status')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="customer-info">
                        <div>
                          <strong>{order.userId?.name || t('unknown')}</strong>
                          <small>{order.userId?.email || t('noEmail')}</small>
                        </div>
                      </td>
                      <td className="order-date">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="order-items">
                        {order.cart?.length || 0} {t('items')}
                      </td>
                      <td className="order-total">
                        <strong>{formatCurrency(order.total)}</strong>
                      </td>
                      <td className="payment-method">
                        {paymentMethods[order.methodePayment] || t('unknown')}
                      </td>
                      <td className="order-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {translateStatus(order.status)}
                        </span>
                      </td>
                      <td className="order-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => setSelectedOrder(order)}
                          title={t('viewOrderDetails')}
                        >
                          👁️ {t('view')}
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updating}
                          className="status-select"
                          title={t('updateOrderStatus')}
                        >
                          <option value="wating">{t('waiting')}</option>
                          <option value="preparing">{t('preparing')}</option>
                          <option value="dlivery">{t('delivery')}</option>
                          <option value="done">{t('completed')}</option>
                        </select>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteOrder(order._id)}
                          title={t('deleteOrderPermanently')}
                        >
                          🗑️ {t('delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{t('orderDetails')} #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="order-info-grid">
                  <div className="info-section">
                    <h3>{t('customerInformation')}</h3>
                    <p><strong>{t('name')}:</strong> {selectedOrder.userId?.name || t('unknown')}</p>
                    <p><strong>{t('email')}:</strong> {selectedOrder.userId?.email || t('noEmail')}</p>
                    <p><strong>{t('phone')}:</strong> {selectedOrder.userId?.phone || t('noPhone')}</p>
                  </div>
                  
                  <div className="info-section">
                    <h3>{t('orderInformation')}</h3>
                    <p><strong>{t('date')}:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>{t('status')}:</strong> 
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                      >
                        {translateStatus(selectedOrder.status)}
                      </span>
                    </p>
                    <p><strong>{t('payment')}:</strong> {paymentMethods[selectedOrder.methodePayment] || t('unknown')}</p>
                    <p><strong>{t('total')}:</strong> <strong>{formatCurrency(selectedOrder.total)}</strong></p>
                  </div>
                  
                  <div className="info-section">
                    <h3>{t('deliveryAddress')}</h3>
                    <p><strong>{t('street')}:</strong> {selectedOrder.address?.street}</p>
                    <p><strong>{t('region')}:</strong> {selectedOrder.address?.region}</p>
                    <p><strong>{t('description')}:</strong> {selectedOrder.address?.descreption}</p>
                  </div>
                </div>
                
                <div className="order-items-section">
                  <h3>{t('orderItems')}</h3>
                  <div className="items-list">
                    {selectedOrder.cart?.map((item, index) => (
                      <div key={index} className="cart-item">
                        <div className="item-info">
                          <strong>{item.productId?.name || t('unknownProduct')}</strong>
                          <p>{t('quantity')}: {item.amount}</p>
                          <p>{t('unitPrice')}: {formatCurrency(item.price)}</p>
                          <p>{t('subtotal')}: {formatCurrency(item.price * item.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
