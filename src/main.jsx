import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Layout from "./pages/Layout.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Login from "./pages/Login/Login.jsx";
import Home from "./pages/Home.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.jsx";
import ErrorPage from "./pages/ErrorPage/ErrorPage.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import LoaderComponent from "./components/LoaderComponent/LoaderComponent.jsx";
import Shop from "./pages/Shop.jsx";
import CartPage from "./pages/Cart/Cart.jsx";
import AdminLayout from "./pages/Admin/AdminLayout.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminCategories from "./pages/Admin/AdminCategories.jsx";
import AdminCategoryForm from "./pages/Admin/AdminCategoryForm.jsx";
import AdminProducts from "./pages/Admin/AdminProducts.jsx";
import AdminProductForm from "./pages/Admin/AdminProductForm.jsx";
import AdminOrders from "./pages/Admin/AdminOrders.jsx";
import AdminReviews from "./pages/Admin/AdminReviews.jsx";
import AdminUsers from "./pages/Admin/AdminUsers.jsx";
import AdminRequests from "./pages/Admin/AdminRequests.jsx";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";
import "./i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

const router = createBrowserRouter(
  [
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
            { path: "cart", element: <CartPage /> },
          ],
        },
      ],
    },
    // Admin Routes - Separate from main layout
    {
      path: "/admin",
      element: <AdminLayout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: "dashboard", element: <AdminDashboard /> },
        // Real admin components
        { path: "categories", element: <AdminCategories /> },
        { path: "categories/new", element: <AdminCategoryForm /> },
        { path: "products", element: <AdminProducts /> },
        { path: "products/new", element: <AdminProductForm /> },
        { path: "orders", element: <AdminOrders /> },
        { path: "reviews", element: <AdminReviews /> },
        { path: "users", element: <AdminUsers /> },
        { path: "requests", element: <AdminRequests /> },
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
  ]
  // {
  //   basename: "/react-pro",
  // }
);

//loader...
function AppLoaderWrapper() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  return loading ? <LoaderComponent /> : <RouterProvider router={router} />;
}

// render
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ScrollToTop />
      <AppLoaderWrapper />
    </I18nextProvider>
  </StrictMode>
);
