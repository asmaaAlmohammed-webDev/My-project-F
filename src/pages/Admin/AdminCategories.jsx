import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../../services/productService';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    descrption: '', // Note: backend uses 'descrption' not 'description'
    photo: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (editingCategory) {
        // Update existing category
        await axios.patch(
          `${API_ENDPOINTS.CATEGORIES}/${editingCategory._id}`,
          formData,
          { headers }
        );
      } else {
        // Create new category
        await axios.post(
          API_ENDPOINTS.CATEGORIES,
          formData,
          { headers }
        );
      }

      // Reload categories and reset form
      await loadCategories();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
      console.error('Error saving category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      descrption: category.descrption || '',
      photo: category.photo || ''
    });
    setShowForm(true);
    
    // Scroll to top smoothly so user can see the edit form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      await axios.delete(
        `${API_ENDPOINTS.CATEGORIES}/${categoryId}`,
        { headers }
      );

      await loadCategories();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', descrption: '', photo: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (imageUrl) => {
    setFormData({
      ...formData,
      photo: imageUrl
    });
  };

  if (loading) {
    return (
      <div className="admin-categories-loading">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="admin-categories-header">
        <h1>Categories Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              // Scroll to top when opening the form
              setTimeout(() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }, 100);
            }
          }}
        >
          {showForm ? 'Cancel' : 'Add New Category'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="category-form-section">
          <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={handleFormSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter category name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descrption">Description</label>
              <textarea
                id="descrption"
                name="descrption"
                value={formData.descrption}
                onChange={handleInputChange}
                placeholder="Enter category description"
                rows="3"
              />
            </div>

            <ImageUpload
              currentImage={formData.photo}
              onImageChange={handleImageChange}
              label="Category Photo"
              required={false}
            />

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="categories-table-section">
        <h2>All Categories ({categories.length})</h2>
        
        {categories.length === 0 ? (
          <div className="no-categories">
            <p>No categories found. Create your first category!</p>
          </div>
        ) : (
          <div className="categories-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Photo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td className="category-name">{category.name}</td>
                    <td className="category-description">
                      {category.descrption || 'No description'}
                    </td>
                    <td className="category-photo">
                      {category.photo ? (
                        <img 
                          src={category.photo} 
                          alt={category.name}
                          className="category-thumbnail"
                        />
                      ) : (
                        'No image'
                      )}
                    </td>
                    <td className="category-actions">
                      <button 
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(category)}
                        title="Edit this category (opens form at top)"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category._id)}
                        title="Delete this category permanently"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
