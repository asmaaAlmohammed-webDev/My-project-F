import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import { isAdmin } from '../../utils/adminAuth';
import './AdminLayout.css';

// ADDED: Admin layout wrapper with sidebar navigation and protected routes
const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  // Redirect to login if not admin
  if (!hasAdminAccess) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      
      <main className={`admin-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
