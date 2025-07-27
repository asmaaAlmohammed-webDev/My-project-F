import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/adminAuth';
import './AdminDashboard.css';

// ADDED: Main admin dashboard with statistics and quick actions
const AdminDashboard = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    reviews: 0,
    orders: 0,
    requests: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get current admin user
        const user = getCurrentUser();
        setAdminUser(user);

        // TODO: Fetch real statistics from API
        // For now, using placeholder data
        setStats({
          categories: 6,
          products: 16,
          reviews: 0,
          orders: 0,
          requests: 0,
          users: 1
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {adminUser?.name || 'Admin'}!</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon categories">
            <i className="fas fa-tags"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.categories}</h3>
            <p>Categories</p>
          </div>
          <Link to="/admin/categories" className="stat-link">
            Manage Categories
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.products}</h3>
            <p>Products</p>
          </div>
          <Link to="/admin/products" className="stat-link">
            Manage Products
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon reviews">
            <i className="fas fa-star"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.reviews}</h3>
            <p>Reviews</p>
          </div>
          <Link to="/admin/reviews" className="stat-link">
            Moderate Reviews
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.orders}</h3>
            <p>Orders</p>
          </div>
          <Link to="/admin/orders" className="stat-link">
            View Orders
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon requests">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.requests}</h3>
            <p>Requests</p>
          </div>
          <Link to="/admin/requests" className="stat-link">
            Handle Requests
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.users}</h3>
            <p>Users</p>
          </div>
          <Link to="/admin/users" className="stat-link">
            Manage Users
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/admin/categories/new" className="action-btn primary">
            <i className="fas fa-plus"></i>
            Add Category
          </Link>
          <Link to="/admin/products/new" className="action-btn primary">
            <i className="fas fa-plus"></i>
            Add Product
          </Link>
          <Link to="/admin/reviews" className="action-btn warning">
            <i className="fas fa-eye"></i>
            Review Moderation
          </Link>
          <Link to="/admin/requests" className="action-btn info">
            <i className="fas fa-envelope-open"></i>
            Customer Requests
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-plus-circle text-green"></i>
            </div>
            <div className="activity-content">
              <p>Database seeded with initial data</p>
              <span className="activity-time">Today</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-cog text-blue"></i>
            </div>
            <div className="activity-content">
              <p>Admin panel setup completed</p>
              <span className="activity-time">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
