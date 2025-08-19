import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import img from "../../assets/imgs/login.png";
import axios from "axios";
import { useState } from "react";
// ADDED: Import centralized API configuration
import { API_ENDPOINTS } from "../../config/api";
// ADDED: Translation hook
import { useTranslation } from "react-i18next";
// ADDED: Notification modal for login promotions
import NotificationModal from "../../components/NotificationModal/NotificationModal";

const Login = () => {
  // ADDED: Translation hook
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // ADDED: Notification modal state
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // إزالة الخطأ عند الكتابة
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: "", password: "" });

    try {
      const response = await axios.post(
        API_ENDPOINTS.LOGIN, // CHANGED: Using centralized API configuration instead of hardcoded URL
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("token", response.data.token);
      
      // ADDED: Show notification modal for login promotions
      setShowNotificationModal(true);
      
      // REMOVED: Auto-navigation - Let user control when to dismiss notifications
      // setTimeout(() => {
      //   navigate("/home");
      // }, 500);
    } catch (err) {
      const backendMessage = err.response?.data?.message || "";
      const fieldErrors = { email: "", password: "" };

      if (backendMessage.toLowerCase().includes("email")) {
        fieldErrors.email = backendMessage;
      }
      if (backendMessage.toLowerCase().includes("password")) {
        fieldErrors.password = backendMessage;
      }

      // خطأ عام غير متعلق بحقل معين
      if (!fieldErrors.email && !fieldErrors.password) {
        fieldErrors.email = backendMessage || "Login failed.";
      }

      setErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ADDED: Notification modal for login promotions */}
      <NotificationModal 
        isOpen={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false);
          navigate("/home");
        }}
        showOnLogin={true}
      />
      
      <div className="login-image" data-aos="zoom-out">
        <img src={img} alt="Login visual" />
      </div>

      <div className="login-form-container">
        <h2 className="login-title" data-aos="zoom-out">
          {t("loginTitle")}
        </h2>

        <form
          className="login-form"
          data-aos="zoom-out"
          onSubmit={handleSubmit}
        >
          <label>{t("emailLabel")}</label>
          <input
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            required
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}

          <label>{t("passwordLabel")}</label>
          <input
            type="password"
            name="password"
            placeholder={t("passwordPlaceholder")}
            required
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? t("loggingIn") : t("loginTitle")}
          </button>
        </form>

        <div className="login-links">
          <Link to="/forgot-password">{t("forgotPassword")}</Link>
          <Link to="/signup">{t("dontHaveAccount")}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
