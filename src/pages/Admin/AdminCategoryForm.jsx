import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import './AdminCategoryForm.css';

const AdminCategoryForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    descrption: '', // Note: backend uses 'descrption' not 'description'
    photo: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.post(
        API_ENDPOINTS.CATEGORIES,
        formData,
        { headers }
      );

      setSuccess(true);
      setFormData({ name: '', descrption: '', photo: '' });
      
      // Redirect to categories list after 2 seconds
      setTimeout(() => {
        navigate('/admin/categories');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || t('failedToCreateCategory'));
      console.error('Error creating category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="admin-category-form">
        <div className="success-message">
          <h2>✅ {t('categoryCreatedSuccessfully')}</h2>
          <p>{t('redirectingToCategoriesList')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-category-form">
      <div className="form-header">
        <h1>{t('addNewCategory')}</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/admin/categories')}
        >
          ← {t('backToCategories')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name">{t('categoryName')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder={t('enterCategoryNamePlaceholder')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descrption">{t('description')}</label>
            <textarea
              id="descrption"
              name="descrption"
              value={formData.descrption}
              onChange={handleInputChange}
              placeholder={t('enterCategoryDescriptionPlaceholder')}
              rows="4"
            />
            <small className="form-help">
              {t('categoryDescriptionHelp')}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="photo">{t('categoryImageUrl')}</label>
            <input
              type="url"
              id="photo"
              name="photo"
              value={formData.photo}
              onChange={handleInputChange}
              placeholder={t('categoryImageUrlPlaceholder')}
            />
            <small className="form-help">
              {t('categoryImageUrlHelp')}
            </small>
          </div>

          {formData.photo && (
            <div className="image-preview">
              <label>{t('imagePreview')}:</label>
              <img 
                src={formData.photo} 
                alt={t('categoryPreview')}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? t('creatingCategory') : t('createCategory')}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/admin/categories')}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCategoryForm;
