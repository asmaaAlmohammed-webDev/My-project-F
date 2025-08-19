import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import { isAdmin } from '../../utils/adminAuth';
import { useTranslation } from 'react-i18next';
import './AdminLayout.css';

// ADDED: Admin layout wrapper with sidebar navigation and protected routes
const AdminLayout = () => {
  const { t, i18n } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const isRTL = i18n.language === 'ar';

  // Check admin authentication on component mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const adminStatus = isAdmin();
        setHasAdminAccess(adminStatus);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setHasAdminAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle document direction for RTL
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [isRTL]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>{t('verifyingAdminAccess')}</p>
      </div>
    );
  }

  // Redirect to login if not admin
  if (!hasAdminAccess) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`admin-layout ${isRTL ? 'rtl' : ''}`}>
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      
      <main className={`admin-main ${isCollapsed ? 'sidebar-collapsed' : ''} ${isRTL ? 'rtl' : ''}`}>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
