import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AdminSidebar.css';
import { 
  TbDashboard, 
  TbCategory, 
  TbBooks, 
  TbStar, 
  TbClipboardList,
  TbShoppingCart,
  TbUsers,
  TbHome,
  TbBox,
  TbLogout,
  TbLanguage,
  TbMenu2,
  TbDiscount,
  TbChartLine
} from 'react-icons/tb';
import { logoutAdmin } from '../../utils/adminAuth';

// ADDED: Admin navigation sidebar with all management sections
const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isArabic, setIsArabic] = useState(i18n.language === "ar");

  const handleLanguageToggle = () => {
    const newLang = isArabic ? "en" : "ar";
    i18n.changeLanguage(newLang);
    setIsArabic(!isArabic);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const menuItems = [
    {
      path: '/home',
      icon: TbHome,
      label: t('backToHome'),
      description: t('returnToMainSite'),
      isExternal: true
    },
    {
      path: '/admin/dashboard',
      icon: TbDashboard,
      label: t('dashboard'),
      description: t('overviewDashboard')
    },
    {
      path: '/admin/statistics',
      icon: TbChartLine,
      label: t('statistics'),
      description: t('statisticsDesc')
    },
    {
      path: '/admin/categories',
      icon: TbCategory,
      label: t('categories'),
      description: t('manageBookCategories')
    },
    {
      path: '/admin/products',
      icon: TbBooks,
      label: t('products'),
      description: t('manageBooksInventory')
    },
    {
      path: '/admin/inventory',
      icon: TbBox,
      label: t('inventory'),
      description: t('stockManagementAlerts')
    },
    {
      path: '/admin/reviews',
      icon: TbStar,
      label: t('reviews'),
      description: t('moderateCustomerReviews')
    },
    {
      path: '/admin/requests',
      icon: TbClipboardList,
      label: t('requests'),
      description: t('customerProductRequests')
    },
    {
      path: '/admin/promotions',
      icon: TbDiscount,
      label: t('promotions'),
      description: t('manageDiscountsLoyalty')
    },
    {
      path: '/admin/orders',
      icon: TbShoppingCart,
      label: t('orders'),
      description: t('orderManagement')
    },
    {
      path: '/admin/users',
      icon: TbUsers,
      label: t('users'),
      description: t('userManagement')
    }
  ];

  const handleLogout = () => {
    if (window.confirm(t('confirmLogout'))) {
      logoutAdmin();
    }
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isRTL ? 'rtl' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <Link to="/home" className="logo">
          <TbBooks className="logo-icon" />
          {!isCollapsed && <span className="logo-text">{t('bookstoreAdmin')}</span>}
        </Link>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? (isRTL ? '←' : '→') : (isRTL ? '→' : '←')}
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
        {/* Language Toggle Button */}
        <button className="language-toggle-btn" onClick={handleLanguageToggle}>
          🌐 {!isCollapsed && <span>{isArabic ? t("english") : t("arabic")}</span>}
        </button>
        
        <button className="logout-btn" onClick={handleLogout}>
          <TbLogout className="logout-icon" />
          {!isCollapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
