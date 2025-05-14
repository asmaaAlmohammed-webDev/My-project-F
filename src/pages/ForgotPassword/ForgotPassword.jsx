
import { Link } from 'react-router-dom';
import './ForgotPassword.css';
import img from "../../assets/imgs/login.png"

const ForgotPassword = () => {
  return (
    <div className="forgot-page">
      <div className="forgot-image" data-aos="zoom-out">
        <img src={img} alt="Forgot password visual" />
      </div>

      <div className="forgot-form-container">
        <h2 className="forgot-title" data-aos="zoom-out">Forgot your password?</h2>
        <p className="forgot-subtitle">Enter your email and we’ll send you a reset link</p>

        <form className="forgot-form" data-aos="zoom-out">
          <label>Email Address</label>
          <input type="email" placeholder="your-email@example.com" required />

          <button type="submit" className="forgot-btn">Send Reset Link</button>
        </form>

        <div className="forgot-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;