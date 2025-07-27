import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { getAuthHeaders } from '../../utils/adminAuth';
import axios from 'axios';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Order status options
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'wating', label: 'Waiting' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'dlivery', label: 'Delivery' },
    { value: 'done', label: 'Completed' }
  ];

  // Payment method labels
  const paymentMethods = {
    cash: 'Cash on Delivery',
    bank: 'Bank Transfer'
  };

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
      setError('Failed to load orders');
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
      setError(err.response?.data?.message || 'Failed to update order status');
      console.error('Error updating order:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const headers = getAuthHeaders();

      await axios.delete(`${API_ENDPOINTS.ORDERS}/${orderId}`, { headers });
      
      setOrders(orders.filter(order => order._id !== orderId));
      setSelectedOrder(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete order');
      console.error('Error deleting order:', err);
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

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
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
        <p>Loading orders...</p>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <h1>Orders Management</h1>
        <div className="orders-stats">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Orders</p>
          </div>
          <div className="stat-card">
            <h3>{stats.wating}</h3>
            <p>Waiting</p>
          </div>
          <div className="stat-card">
            <h3>{stats.preparing}</h3>
            <p>Preparing</p>
          </div>
          <div className="stat-card">
            <h3>{stats.dlivery}</h3>
            <p>In Delivery</p>
          </div>
          <div className="stat-card">
            <h3>{stats.done}</h3>
            <p>Completed</p>
          </div>
          <div className="stat-card revenue">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
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
          <label htmlFor="statusFilter">Filter by Status:</label>
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
          🔄 Refresh
        </button>
      </div>

      <div className="orders-content">
        <div className="orders-list">
          <h2>Orders ({filteredOrders.length})</h2>
          
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
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
                          <strong>{order.userId?.name || 'Unknown'}</strong>
                          <small>{order.userId?.email || 'No email'}</small>
                        </div>
                      </td>
                      <td className="order-date">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="order-items">
                        {order.cart?.length || 0} items
                      </td>
                      <td className="order-total">
                        <strong>{formatCurrency(order.total)}</strong>
                      </td>
                      <td className="payment-method">
                        {paymentMethods[order.methodePayment] || order.methodePayment}
                      </td>
                      <td className="order-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="order-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => setSelectedOrder(order)}
                          title="View order details"
                        >
                          👁️ View
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updating}
                          className="status-select"
                          title="Update order status"
                        >
                          <option value="wating">Waiting</option>
                          <option value="preparing">Preparing</option>
                          <option value="dlivery">Delivery</option>
                          <option value="done">Completed</option>
                        </select>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Delete order permanently"
                        >
                          🗑️ Delete
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
                <h2>Order Details #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
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
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> {selectedOrder.userId?.name || 'Unknown'}</p>
                    <p><strong>Email:</strong> {selectedOrder.userId?.email || 'No email'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.userId?.phone || 'No phone'}</p>
                  </div>
                  
                  <div className="info-section">
                    <h3>Order Information</h3>
                    <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>Status:</strong> 
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><strong>Payment:</strong> {paymentMethods[selectedOrder.methodePayment]}</p>
                    <p><strong>Total:</strong> <strong>{formatCurrency(selectedOrder.total)}</strong></p>
                  </div>
                  
                  <div className="info-section">
                    <h3>Delivery Address</h3>
                    <p><strong>Street:</strong> {selectedOrder.address?.street}</p>
                    <p><strong>Region:</strong> {selectedOrder.address?.region}</p>
                    <p><strong>Description:</strong> {selectedOrder.address?.descreption}</p>
                  </div>
                </div>
                
                <div className="order-items-section">
                  <h3>Order Items</h3>
                  <div className="items-list">
                    {selectedOrder.cart?.map((item, index) => (
                      <div key={index} className="cart-item">
                        <div className="item-info">
                          <strong>{item.productId?.name || 'Unknown Product'}</strong>
                          <p>Quantity: {item.amount}</p>
                          <p>Unit Price: {formatCurrency(item.price)}</p>
                          <p>Subtotal: {formatCurrency(item.price * item.amount)}</p>
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
