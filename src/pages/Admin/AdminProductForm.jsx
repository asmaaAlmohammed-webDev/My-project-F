import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../services/productService';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import './AdminProductForm.css';

const AdminProductForm = () => {
  const navigate = useNavigate();
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
      setError('Failed to load categories');
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
        throw new Error('Please enter a valid price greater than 0');
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
      setError(err.message || err.response?.data?.message || 'Failed to create product');
      console.error('Error creating product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="admin-product-form">
        <div className="success-message">
          <h2>✅ Product Created Successfully!</h2>
          <p>Redirecting to products list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-product-form">
      <div className="form-header">
        <h1>Add New Product</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/admin/products')}
        >
          ← Back to Products
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
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter product name (e.g., The Great Gatsby)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
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
            <label htmlFor="categoryId">Category *</label>
            {loadingCategories ? (
              <div className="loading-categories">Loading categories...</div>
            ) : (
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            <small className="form-help">
              Choose the category that best fits this product.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a detailed description of the product"
              rows="4"
            />
            <small className="form-help">
              This description will help customers understand what the product is about.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Image URL</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/product-image.jpg"
            />
            <small className="form-help">
              Optional: Provide a URL to an image of the product.
            </small>
          </div>

          {formData.image && (
            <div className="image-preview">
              <label>Image Preview:</label>
              <img 
                src={formData.image} 
                alt="Product preview"
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
              {submitting ? 'Creating Product...' : 'Create Product'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
