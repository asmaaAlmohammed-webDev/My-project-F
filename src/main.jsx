import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Layout from "./pages/Layout.jsx";
import Auth from "./pages/Auth.jsx";
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

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "",
          element: <Auth />,
          children: [
            { path: "signup", element: <Signup /> },
            { path: "login", element: <Login /> },
            { path: "forgot-password", element: <ForgotPassword /> },
          ],
        },
        {
          element: <ProtectedRoute />,
          children: [
            { index: true, element: <Home /> },
            { path: "home", element: <Home /> },
            { path: "shop", element: <Shop /> },
            { path: "profile", element: <Profile /> },
            { path: "contact", element: <ContactUs /> },
            { path: "cart", element: <CartPage /> },
          ],
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
    <AppLoaderWrapper />
  </StrictMode>
);
