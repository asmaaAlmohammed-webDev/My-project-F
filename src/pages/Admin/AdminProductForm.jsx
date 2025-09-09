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

  // Function to translate category names
  const translateCategoryName = (name) => {
    const categoryTranslations = {
      'Fiction': t('categoryFiction'),
      'Science Fiction': t('categoryScienceFiction'),
      'Biography': t('categoryBiography'),
      'History': t('categoryHistory'),
      'Romance': t('categoryRomance'),
      'Mystery': t('categoryMystery'),
      'Thriller': t('categoryThriller'),
      'Fantasy': t('categoryFantasy'),
      'Horror': t('categoryHorror'),
      'Self Help': t('categorySelfHelp'),
      'Business': t('categoryBusiness'),
      'Technology': t('categoryTechnology'),
      'Children': t('categoryChildren'),
      'Education': t('categoryEducation'),
      'Travel': t('categoryTravel')
    };
    return categoryTranslations[name] || name;
  };
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description_en: '',
    description_ar: '',
    price: '',
    image: '',
    categoryId: '',
    stock: '',
    minStockLevel: '',
    publisherEmail: ''
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
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 1
      };

      if (isNaN(productData.price) || productData.price <= 0) {
        throw new Error(t('pleaseEnterValidPrice'));
      }

      if (productData.stock < 0) {
        throw new Error(t('stockCannotBeNegative'));
      }

      if (productData.minStockLevel < 1) {
        throw new Error(t('minStockLevelAtLeastOne'));
      }

      await axios.post(
        API_ENDPOINTS.PRODUCTS,
        productData,
        { headers }
      );

      setSuccess(true);
      setFormData({ 
        name: '', 
        description_en: '', 
        description_ar: '', 
        price: '', 
        image: '', 
        categoryId: '',
        stock: '',
        minStockLevel: '',
        publisherEmail: ''
      });
      
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
                placeholder={t('enterPrice')}
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
                    {translateCategoryName(category.name)}
                  </option>
                ))}
              </select>
            )}
            <small className="form-help">
              {t('chooseCategoryHelp')}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description_en">{t('description')} (English)</label>
            <textarea
              id="description_en"
              name="description_en"
              value={formData.description_en}
              onChange={handleInputChange}
              placeholder={t('enterDetailedDescriptionEn')}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description_ar">{t('description')} (Arabic)</label>
            <textarea
              id="description_ar"
              name="description_ar"
              value={formData.description_ar}
              onChange={handleInputChange}
              placeholder={t('enterDescriptionArabic')}
              rows="3"
              dir="rtl"
            />
            <small className="form-help">
              {t('descriptionHelp')}
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">{t('currentStock')} *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                placeholder={t('enterStockQuantity')}
              />
              <small className="form-help">{t('currentStockHelp')}</small>
            </div>

            <div className="form-group">
              <label htmlFor="minStockLevel">{t('minStockLevel')} *</label>
              <input
                type="number"
                id="minStockLevel"
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleInputChange}
                required
                min="1"
                placeholder={t('minStockLevelPlaceholder')}
              />
              <small className="form-help">{t('minStockLevelHelp')}</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="publisherEmail">{t('publisherEmail')}</label>
            <input
              type="email"
              id="publisherEmail"
              name="publisherEmail"
              value={formData.publisherEmail}
              onChange={handleInputChange}
              placeholder={t('publisherEmailPlaceholder')}
            />
            <small className="form-help">{t('publisherEmailHelp')}</small>
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
              disabled={submitting || !formData.name.trim() || !formData.price || !formData.categoryId || !formData.stock || !formData.minStockLevel}
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
