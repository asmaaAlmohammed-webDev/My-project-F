import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import './AdminCategoryForm.css';

const AdminCategoryForm = () => {
  const navigate = useNavigate();
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
      setError(err.response?.data?.message || 'Failed to create category');
      console.error('Error creating category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="admin-category-form">
        <div className="success-message">
          <h2>✅ Category Created Successfully!</h2>
          <p>Redirecting to categories list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-category-form">
      <div className="form-header">
        <h1>Add New Category</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/admin/categories')}
        >
          ← Back to Categories
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
            <label htmlFor="name">Category Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter category name (e.g., Science Fiction)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descrption">Description</label>
            <textarea
              id="descrption"
              name="descrption"
              value={formData.descrption}
              onChange={handleInputChange}
              placeholder="Enter a brief description of this category"
              rows="4"
            />
            <small className="form-help">
              This description will help users understand what books belong in this category.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="photo">Category Image URL</label>
            <input
              type="url"
              id="photo"
              name="photo"
              value={formData.photo}
              onChange={handleInputChange}
              placeholder="https://example.com/category-image.jpg"
            />
            <small className="form-help">
              Optional: Provide a URL to an image that represents this category.
            </small>
          </div>

          {formData.photo && (
            <div className="image-preview">
              <label>Image Preview:</label>
              <img 
                src={formData.photo} 
                alt="Category preview"
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
              {submitting ? 'Creating Category...' : 'Create Category'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/admin/categories')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCategoryForm;
