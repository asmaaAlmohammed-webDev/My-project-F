import { useState, useEffect } from "react";
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
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
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
            Home
          </NavLink>
          <NavLink to="/shop" className="nav-link">
            <GiBookshelf /> Shop
          </NavLink>
          <NavLink to="/contact" className="nav-link">
            <IoMailOpen /> Contact
          </NavLink>
        </nav>

                <div className="actions">
          <button onClick={handleProfileClick} className="login-icon profile-btn">
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
