import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from "./../../assets/imgs/logo.png";
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa6';
import { AiFillInstagram } from 'react-icons/ai';
import { TbBrandLinkedin, TbBrandLinkedinFilled } from 'react-icons/tb';
import { RiFacebookCircleLine } from 'react-icons/ri';
import { FiYoutube } from 'react-icons/fi';
const Footer = () => {
    return (
        <footer className="footer " data-aos="zoom-in-down" data-aos-duration="1900">
            <div className="footer-top">
                <h2 className="footer-heading">Discover books that ignite your imagination</h2>
                <p className="footer-subheading">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni, ducimus iste?</p>
            </div>

            <div className="footer-content">
                <div className="footer-column brand">
                    <div className="logo">  <img src={logo} alt="logo" className="logo-img" /> Bookletto</div>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nulla recusandae excepturi nostrum cum delectus repellat?</p>
                    <form className="subscribe-form">
                        <input type="email" placeholder="Enter your email" />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>

                <div className="footer-column">
                    <h4>Learn More</h4>
                    <nav className="footer-links">
                        <Link to="/about">About Us</Link>
                        <Link to="/latest">Latest books</Link>
                        <Link to="/offers">Hot Offers</Link>
                        <Link to="/popular">Popular books</Link>
                        <Link to="/faq">FAQ</Link>
                        <Link to="/privacy">Privacy Policy</Link>
                    </nav>
                </div>

                <div className="footer-column">
                    <h4>Our Community</h4>
                    <nav className="footer-links">
                        <Link to="/terms">Terms and Conditions</Link>
                        <Link to="/special">Special Offers</Link>
                        <Link to="/reviews">Customer Reviews</Link>
                    </nav>
                </div>

                <div className="footer-column">
                    <h4>Contact Us</h4>
                    <p>Contact Number: +963 9565 55678</p>
                    <p>Email Address: Bookletto@gmail.com</p>
                    <div className="social">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><RiFacebookCircleLine /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FiYoutube /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><TbBrandLinkedin /></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2025 Bookletto</p>
                <p>All rights reserved</p>
            </div>
        </footer>
    );
};

export default Footer;