import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import logo from "./../../assets/imgs/logo.png";
import { TbHomeFilled } from "react-icons/tb";
import { GiBookshelf } from "react-icons/gi";
import { IoLogIn, IoMailOpen, IoPersonSharp } from "react-icons/io5";
import { FaCartFlatbedSuitcase } from "react-icons/fa6";
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar" data-aos="zoom-in" data-aos-duration="1500">
      <div className="container">
        <div className="logo">
          <img src={logo} alt="logo" className="logo-img" />
          Bookletto
        </div>

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" className="nav-link">
            <TbHomeFilled />Home
          </NavLink>
          <NavLink to="/shop" className="nav-link">
            <GiBookshelf /> Shop
          </NavLink>
          <NavLink to="/contact" className="nav-link">
            <IoMailOpen /> Contact
          </NavLink>
        </nav>

        <div className="actions">
          <NavLink to="/cart" className="cart-icon">
            <FaCartFlatbedSuitcase /><span className="badge">0</span>
          </NavLink>
          <NavLink to="/login" className="login-icon">
            <IoLogIn />
          </NavLink>
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
