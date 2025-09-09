import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import TestProductDetail from './pages/TestProductDetail';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Profile from './pages/Profile/Profile';
import Cart from './pages/Cart/Cart';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import ProtectedRoute from './pages/ProtectedRoute';
import LoaderComponent from './components/LoaderComponent/LoaderComponent';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminStatistics from './pages/Admin/AdminStatistics';
import AdminCategories from './pages/Admin/AdminCategories';
import AdminCategoryForm from './pages/Admin/AdminCategoryForm';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminProductForm from './pages/Admin/AdminProductForm';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminReviews from './pages/Admin/AdminReviews';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminRequests from './pages/Admin/AdminRequests';
import AdminInventory from './pages/Admin/AdminInventory';
import AdminNotifications from './pages/Admin/AdminNotifications';
import AdminPromotions from './pages/Admin/AdminPromotions';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import ChatWidget from './components/ChatWidget/ChatWidget';
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      // Public Routes (no authentication required)
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "shop", element: <Shop /> },
      { path: "contact", element: <ContactUs /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "forgot-password", element: <ForgotPassword /> },

      // Protected Routes (authentication required)
      {
        element: <ProtectedRoute />,
        children: [
          { path: "profile", element: <Profile /> },
          { path: "cart", element: <Cart /> },
        ],
      },
    ],
  },
  // Product Detail Route - Outside Layout
  { 
    path: "/product/:id", 
    element: <TestProductDetail />,
    errorElement: <ErrorPage />
  },
  { 
    path: "/test", 
    element: <div style={{padding:'40px', textAlign:'center'}}><h1>🧪 Test Route Works!</h1></div>,
    errorElement: <ErrorPage />
  },
  // Admin Routes - Separate from main layout
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "statistics", element: <AdminStatistics /> },
      // Real admin components
      { path: "categories", element: <AdminCategories /> },
      { path: "categories/new", element: <AdminCategoryForm /> },
      { path: "products", element: <AdminProducts /> },
      { path: "products/new", element: <AdminProductForm /> },
      { path: "inventory", element: <AdminInventory /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "reviews", element: <AdminReviews /> },
      { path: "users", element: <AdminUsers /> },
      { path: "requests", element: <AdminRequests /> },
      { path: "notifications", element: <AdminNotifications /> },
      { path: "promotions", element: <AdminPromotions /> },
      // Catch-all for any other admin sub-routes
      {
        path: "*",
        element: (
          <div style={{ padding: "20px" }}>
            <h2>Admin Page</h2>
            <p>This admin feature is coming soon!</p>
          </div>
        ),
      },
    ],
  },
]);

function AppLoaderWrapper() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  return loading ? <LoaderComponent /> : <RouterProvider router={router} />;
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ScrollToTop />
      <ChatWidget />
      <AppLoaderWrapper />
    </I18nextProvider>
  );
}

export default App;
