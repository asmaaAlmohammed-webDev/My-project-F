import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "./../../assets/imgs/logo.png";
import { TbHomeFilled } from "react-icons/tb";
import { GiBookshelf } from "react-icons/gi";
import { IoLogIn, IoLogOut, IoMailOpen } from "react-icons/io5";
import { FaCartFlatbedSuitcase } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { getCartItemCount } from "../../utils/cartUtils";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem("token");

  // Update cart count on component mount and when cart changes
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };

    // Set initial cart count
    updateCartCount();

    // Listen for cart updates
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Handle profile button click
  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/home");
    // Refresh the page to reset any cached user state
    window.location.reload();
  };

  const { i18n, t } = useTranslation();
  const [isArabic, setIsArabic] = useState(i18n.language === "ar");

  const handleLanguageToggle = () => {
    const newLang = isArabic ? "en" : "ar";
    i18n.changeLanguage(newLang);
    setIsArabic(!isArabic);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <header className="navbar" data-aos="zoom-in" data-aos-duration="1500">
      <div className="container">
        <NavLink to="/home" className="logo">
          <img src={logo} alt="logo" className="logo-img" />
          Bookletto
        </NavLink>

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <NavLink to="/home" className="nav-link">
            <TbHomeFilled />
            {t("home")}
          </NavLink>
          <NavLink to="/shop" className="nav-link">
            <GiBookshelf /> {t("shop")}
          </NavLink>
          <NavLink to="/contact" className="nav-link">
            <IoMailOpen /> {t("contact")}
          </NavLink>
        </nav>

        <div className="actions">
          {/* Language Toggle Button */}
          <button
            className="lang-toggle-btn"
            onClick={handleLanguageToggle}
            // style={{
            //   marginRight: "20px",
            //   padding: "8px 16px",
            //   borderRadius: "20px",
            //   border: "none",
            //   background: "#7c4dff",
            //   color: "white",
            //   fontWeight: "bold",
            //   cursor: "pointer",
            // }}
          >
            {isArabic ? t("english") : t("arabic")}
          </button>
          <button
            onClick={handleProfileClick}
            className="login-icon profile-btn"
          >
            <FaUserCircle />
          </button>
          <NavLink to="/cart" className="cart-icon">
            <FaCartFlatbedSuitcase />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </NavLink>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="login-icon logout-btn">
              <IoLogOut />
            </button>
          ) : (
            <NavLink to="/login" className="login-icon">
              <IoLogIn />
            </NavLink>
          )}
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
