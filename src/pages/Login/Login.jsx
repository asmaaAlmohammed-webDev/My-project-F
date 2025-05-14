
import { Link } from 'react-router-dom';
import './Login.css';
import img from "../../assets/imgs/login.png"

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-image" data-aos="zoom-out">
        <img src={img} alt="Login visual" />
      </div>

      <div className="login-form-container">
        <h2 className="login-title" data-aos="zoom-out">Login</h2>

        <form className="login-form" data-aos="zoom-out">
          <label>Email</label>
          <input type="email" placeholder="user@example.com" required />

          <label>Password</label>
          <input type="password" placeholder="•••••" required />

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="login-links">
          <Link to="/forgot-password">Forgot your password?</Link>
          <Link to="/signup">Don't have an account? Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;