import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/adminAuth';
import './AdminDashboard.css';
// ADDED: Translation hook
import { useTranslation } from 'react-i18next';

// ADDED: Main admin dashboard with statistics and quick actions
const AdminDashboard = () => {
  // ADDED: Translation hook
  const { t } = useTranslation();
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
        <p>{t('loadingDashboard')}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1>{t('adminDashboard')}</h1>
        <p>{t('welcomeBack')}, {adminUser?.name || 'Admin'}!</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon categories">
            <i className="fas fa-tags"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.categories}</h3>
            <p>{t('categories')}</p>
          </div>
          <Link to="/admin/categories" className="stat-link">
            {t('manageCategories')}
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.products}</h3>
            <p>{t('productsAdmin')}</p>
          </div>
          <Link to="/admin/products" className="stat-link">
            {t('manageProducts')}
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon reviews">
            <i className="fas fa-star"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.reviews}</h3>
            <p>{t('reviews')}</p>
          </div>
          <Link to="/admin/reviews" className="stat-link">
            {t('manageReviews')}
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.orders}</h3>
            <p>{t('ordersAdmin')}</p>
          </div>
          <Link to="/admin/orders" className="stat-link">
            {t('manageOrders')}
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon requests">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.requests}</h3>
            <p>{t('requests')}</p>
          </div>
          <Link to="/admin/requests" className="stat-link">
            {t('manageRequests')}
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.users}</h3>
            <p>{t('users')}</p>
          </div>
          <Link to="/admin/users" className="stat-link">
            {t('manageUsers')}
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>{t('quickActions')}</h2>
        <div className="actions-grid">
          <Link to="/admin/categories/new" className="action-btn primary">
            <i className="fas fa-plus"></i>
            {t('addNewCategory')}
          </Link>
          <Link to="/admin/products/new" className="action-btn primary">
            <i className="fas fa-plus"></i>
            {t('addNewProduct')}
          </Link>
          <Link to="/admin/reviews" className="action-btn warning">
            <i className="fas fa-eye"></i>
            {t('manageReviews')}
          </Link>
          <Link to="/admin/requests" className="action-btn info">
            <i className="fas fa-envelope-open"></i>
            {t('manageRequests')}
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
