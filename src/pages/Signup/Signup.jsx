
import { Link } from 'react-router-dom';
import './Signup.css';
import img from "../../assets/imgs/login.png"

const Signup = () => {
  return (
    <div className="signup-page">
      <div className="signup-image" data-aos="zoom-out">
        <img src={img} alt="Signup visual" />
      </div>

      <div className="signup-form-container">
        <h2 className="signup-title" data-aos="zoom-out">Create Account</h2>

        <form className="signup-form" data-aos="zoom-out">
          <label>Full Name</label>
          <input type="text" placeholder="John Doe" required />

          <label>Email</label>
          <input type="email" placeholder="user@example.com" required />

          <label>Password</label>
          <input type="password" placeholder="••••••••" required />

          <label>Confirm Password</label>
          <input type="password" placeholder="••••••••" required />

          <button type="submit" className="signup-btn">Sign Up</button>
        </form>

        <div className="signup-links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;