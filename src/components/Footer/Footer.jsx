import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Footer.css";

import logo from "./../../assets/imgs/logo.png";
import { FaInstagram } from "react-icons/fa6";
import { TbBrandLinkedin } from "react-icons/tb";
import { RiFacebookCircleLine } from "react-icons/ri";
import { FiYoutube } from "react-icons/fi";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer
      className="footer"
      data-aos="zoom-in-down"
      data-aos-duration="1900"
    >
      <div className="footer-top">
        <h2 className="footer-heading">{t("discoverBooks")}</h2>
        <p className="footer-subheading">{t("exploreWorld")}</p>
      </div>

      <div className="footer-content">
        <div className="footer-column brand">
          <div className="logo">
            <img src={logo} alt="logo" className="logo-img" /> Bookletto
          </div>
          <p>{t("welcome")}</p>
        </div>

        <div className="footer-column">
          <h4>{t("featuresTitle")}</h4>
          <nav className="footer-links">
            <Link to="/about">{t("aboutUs")}</Link>
            <Link to="/latest">{t("newArrivals")}</Link>
            <Link to="/offers">{t("hotOffers")}</Link>
            <Link to="/popular">{t("popularBooks")}</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/privacy">{t("privacyPolicy")}</Link>
          </nav>
        </div>

        <div className="footer-column">
          <h4>{t("ourCommunity")}</h4>
          <nav className="footer-links">
            <Link to="/terms">{t("termsAndConditions")}</Link>
            <Link to="/special">{t("specialOffers")}</Link>
            <Link to="/reviews">{t("customerReviews")}</Link>
          </nav>
        </div>

        <div className="footer-column social">
          <h4>{t("followUs")}</h4>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <TbBrandLinkedin />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <RiFacebookCircleLine />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <FiYoutube />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Bookletto. {t("allRightsReserved")}</p>
      </div>
    </footer>
  );
};

export default Footer;
