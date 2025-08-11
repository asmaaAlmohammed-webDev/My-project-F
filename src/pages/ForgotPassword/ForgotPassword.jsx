import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";
import img from "../../assets/imgs/login.png";
// ADDED: Import centralized API configuration
import { API_ENDPOINTS } from "../../config/api";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        API_ENDPOINTS.FORGOT_PASSWORD, // CHANGED: Using centralized API configuration
        {
          email,
        }
      );
      setMessage(res.data.message || t('checkEmailForResetLink'));
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.response?.data?.message || t('failedToSendResetLink')
      );
      setMessageType("error");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-image" data-aos="zoom-out">
        <img src={img} alt={t('forgotPasswordVisual')} />
      </div>

      <div className="forgot-form-container">
        <h2 className="forgot-title" data-aos="zoom-out">
          {t('forgotYourPassword')}
        </h2>
        <p className="forgot-subtitle">
          {t('enterEmailForResetLink')}
        </p>

        {/* ✅ عرض الرسالة */}
        {message && <p className={`message ${messageType}`}>{message}</p>}

        <form
          className="forgot-form"
          data-aos="zoom-out"
          onSubmit={handleSubmit}
        >
          <label>{t('emailAddress')}</label>
          <input
            type="email"
            placeholder={t('forgotEmailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="forgot-btn">
            {t('sendResetLink')}
          </button>
        </form>

        <div className="forgot-links">
          <Link to="/login">{t('backToLogin')}</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
