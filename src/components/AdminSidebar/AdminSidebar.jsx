import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';
import { 
  TbDashboard, 
  TbCategory, 
  TbBooks, 
  TbStar, 
  TbClipboardList,
  TbShoppingCart,
  TbLogout,
  TbUsers,
  TbHome
} from 'react-icons/tb';
import { logoutAdmin } from '../../utils/adminAuth';

// ADDED: Admin navigation sidebar with all management sections
const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/home',
      icon: TbHome,
      label: 'Back to Home',
      description: 'Return to Main Site',
      isExternal: true
    },
    {
      path: '/admin/dashboard',
      icon: TbDashboard,
      label: 'Dashboard',
      description: 'Overview & Statistics'
    },
    {
      path: '/admin/categories',
      icon: TbCategory,
      label: 'Categories',
      description: 'Manage Book Categories'
    },
    {
      path: '/admin/products',
      icon: TbBooks,
      label: 'Products',
      description: 'Manage Books & Inventory'
    },
    {
      path: '/admin/reviews',
      icon: TbStar,
      label: 'Reviews',
      description: 'Moderate Customer Reviews'
    },
    {
      path: '/admin/requests',
      icon: TbClipboardList,
      label: 'Requests',
      description: 'Customer Product Requests'
    },
    {
      path: '/admin/orders',
      icon: TbShoppingCart,
      label: 'Orders',
      description: 'Order Management'
    },
    {
      path: '/admin/users',
      icon: TbUsers,
      label: 'Users',
      description: 'User Management'
    }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logoutAdmin();
    }
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <Link to="/home" className="logo">
          <TbBooks className="logo-icon" />
          {!isCollapsed && <span className="logo-text">BookStore Admin</span>}
        </Link>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isExternal = item.isExternal;
            
            return (
              <li key={item.path} className={`nav-item ${isActive ? 'active' : ''} ${isExternal ? 'external' : ''}`}>
                <Link to={item.path} className="nav-link">
                  <Icon className="nav-icon" />
                  {!isCollapsed && (
                    <div className="nav-content">
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-description">{item.description}</span>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <TbLogout className="logout-icon" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
