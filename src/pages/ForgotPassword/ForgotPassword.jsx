import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";
import img from "../../assets/imgs/login.png";
// ADDED: Import centralized API configuration
import { API_ENDPOINTS } from "../../config/api";

const ForgotPassword = () => {
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
      setMessage(res.data.message || "Check your email for the reset link");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "❌ Failed to send reset link"
      );
      setMessageType("error");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-image" data-aos="zoom-out">
        <img src={img} alt="Forgot password visual" />
      </div>

      <div className="forgot-form-container">
        <h2 className="forgot-title" data-aos="zoom-out">
          Forgot your password?
        </h2>
        <p className="forgot-subtitle">
          Enter your email and we’ll send you a reset link
        </p>

        {/* ✅ عرض الرسالة */}
        {message && <p className={`message ${messageType}`}>{message}</p>}

        <form
          className="forgot-form"
          data-aos="zoom-out"
          onSubmit={handleSubmit}
        >
          <label>Email Address</label>
          <input
            type="email"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="forgot-btn">
            Send Reset Link
          </button>
        </form>

        <div className="forgot-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
