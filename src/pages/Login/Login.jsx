import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import img from "../../assets/imgs/login.png";
import axios from "axios";
import { useState } from "react";

const Login = () => {
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
        "http://localhost:7000/api/v1.0.0/users/login",
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("token", response.data.token);
      navigate("/home");
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
      <div className="login-image" data-aos="zoom-out">
        <img src={img} alt="Login visual" />
      </div>

      <div className="login-form-container">
        <h2 className="login-title" data-aos="zoom-out">
          Login
        </h2>

        <form
          className="login-form"
          data-aos="zoom-out"
          onSubmit={handleSubmit}
        >
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="user@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="•••••••"
            required
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
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
