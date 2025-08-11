import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./ContactUsComp.css";
// ADDED: Import centralized API configuration
import { API_ENDPOINTS } from "../../config/api";

const ContactUsComp = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    try {
      await axios.post(API_ENDPOINTS.CONTACT, form); // CHANGED: Using centralized API configuration
  setSuccess(t("successContact"));
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
  setError(t("errorContact"));
    }
  };

  return (
    <div
      className="contact-container"
      data-aos="fade-up"
      data-aos-duration="3000"
    >
      <h2>{t("contactUs")}</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder={t("yourName")}
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder={t("yourEmail")}
          value={form.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder={t("yourMessage")}
          value={form.message}
          onChange={handleChange}
          required
        />
        <button type="submit">{t("sendMessage")}</button>
        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-msg">{error}</div>}
      </form>
    </div>
  );
};

export default ContactUsComp;
