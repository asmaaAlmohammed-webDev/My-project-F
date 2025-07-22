import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import img from "../../assets/imgs/login.png";
import axios from "axios";
import { useState } from "react";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // احذف الخطأ عند الكتابة
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ name: "", email: "", password: "", phone: "" });

    try {
      const res = await axios.post(
        "http://localhost:7000/api/v1.0.0/users/signup",
        formData
      );

      // احفظ التوكن ووجه للمسار المطلوب
      localStorage.setItem("token", res.data.token);
      navigate("/login");
    } catch (err) {
      const backendMessage = err.response?.data?.message || "";
      const fieldErrors = { name: "", email: "", password: "", phone: "" };

      // افحص نص الرسالة وحدد الحقول المتأثرة
      if (backendMessage.toLowerCase().includes("name")) {
        fieldErrors.name = backendMessage;
      }
      if (backendMessage.toLowerCase().includes("email")) {
        fieldErrors.email = backendMessage;
      }
      if (backendMessage.toLowerCase().includes("password")) {
        fieldErrors.password = backendMessage;
      }
      if (backendMessage.toLowerCase().includes("phone")) {
        fieldErrors.phone = backendMessage;
      }

      // إذا ما انعرف الحقل، اعرضه عشوائيًا تحت الاسم مثلًا
      if (
        !fieldErrors.name &&
        !fieldErrors.email &&
        !fieldErrors.password &&
        !fieldErrors.phone
      ) {
        fieldErrors.name = backendMessage || "Signup failed.";
      }

      setErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-image" data-aos="zoom-out">
        <img src={img} alt="Signup visual" />
      </div>
      <div className="signup-form-container">
        <h2 className="signup-title" data-aos="zoom-out">
          Create Account
        </h2>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}

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

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="1234567890"
            required
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className="field-error">{errors.phone}</p>}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="signup-links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};
export default Signup;
