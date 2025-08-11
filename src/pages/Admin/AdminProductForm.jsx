import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '../../services/productService';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import './AdminProductForm.css';

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(t('failedToLoadCategories'));
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

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

      // Convert price to number and validate
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (isNaN(productData.price) || productData.price <= 0) {
        throw new Error(t('pleaseEnterValidPrice'));
      }

      await axios.post(
        API_ENDPOINTS.PRODUCTS,
        productData,
        { headers }
      );

      setSuccess(true);
      setFormData({ name: '', description: '', price: '', image: '', categoryId: '' });
      
      // Redirect to products list after 2 seconds
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);

    } catch (err) {
      setError(err.message || err.response?.data?.message || t('failedToCreateProduct'));
      console.error('Error creating product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="admin-product-form">
        <div className="success-message">
          <h2>✅ {t('productCreatedSuccessfully')}</h2>
          <p>{t('redirectingToProductsList')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-product-form">
      <div className="form-header">
        <h1>{t('addNewProduct')}</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/admin/products')}
        >
          ← {t('backToProducts')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('productName')} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder={t('enterProductNamePlaceholder')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">{t('price')} ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">{t('category')} *</label>
            {loadingCategories ? (
              <div className="loading-categories">{t('loadingCategories')}</div>
            ) : (
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
              >
                <option value="">{t('selectCategory')}</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            <small className="form-help">
              {t('chooseCategoryHelp')}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('description')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t('enterDetailedDescriptionPlaceholder')}
              rows="4"
            />
            <small className="form-help">
              {t('descriptionHelp')}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="image">{t('productImageUrl')}</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder={t('imageUrlPlaceholder')}
            />
            <small className="form-help">
              {t('imageUrlHelp')}
            </small>
          </div>

          {formData.image && (
            <div className="image-preview">
              <label>{t('imagePreview')}:</label>
              <img 
                src={formData.image} 
                alt={t('productPreview')}
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
              disabled={submitting || !formData.name.trim() || !formData.price || !formData.categoryId}
            >
              {submitting ? t('creatingProduct') : t('createProduct')}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/admin/products')}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
