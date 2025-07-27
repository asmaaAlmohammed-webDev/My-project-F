import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchCategories } from '../../services/productService';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch products and categories on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
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

      // Convert price to number
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        // Update existing product
        await axios.patch(
          `${API_ENDPOINTS.PRODUCTS}/${editingProduct._id}`,
          productData,
          { headers }
        );
      } else {
        // Create new product
        await axios.post(
          API_ENDPOINTS.PRODUCTS,
          productData,
          { headers }
        );
      }

      // Reload products and reset form
      await loadData();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
      console.error('Error saving product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image: product.image || '',
      categoryId: product.categoryId?._id || ''
    });
    setShowForm(true);
    
    // Scroll to top smoothly so user can see the edit form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      await axios.delete(
        `${API_ENDPOINTS.PRODUCTS}/${productId}`,
        { headers }
      );

      await loadData();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', image: '', categoryId: '' });
    setEditingProduct(null);
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
      image: imageUrl
    });
  };

  const getCategoryName = (categoryId) => {
    if (typeof categoryId === 'object' && categoryId?.name) {
      return categoryId.name;
    }
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Helper function to get the correct image path
  const getImageSrc = (imageValue) => {
    if (!imageValue) return '';
    
    // If it's already a full URL (Cloudinary), use as is
    if (imageValue.startsWith('http') || imageValue.startsWith('https')) {
      return imageValue;
    }
    
    // If it's a local filename, construct the path
    return `/src/assets/imgs/${imageValue}`;
  };

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h1>Products Management</h1>
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
          {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="product-form-section">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleFormSubmit} className="product-form">
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
                  placeholder="Enter product name"
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
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows="4"
              />
            </div>

            <ImageUpload
              currentImage={formData.image}
              onImageChange={handleImageChange}
              label="Product Image"
              required={false}
            />

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
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

      {/* Products Table */}
      <div className="products-table-section">
        <h2>All Products ({products.length})</h2>
        
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products found. Create your first product!</p>
          </div>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="product-image">
                      {product.image ? (
                        <img 
                          src={getImageSrc(product.image)} 
                          alt={product.name}
                          className="product-thumbnail"
                        />
                      ) : (
                        <div className="no-image">No image</div>
                      )}
                    </td>
                    <td className="product-name">{product.name}</td>
                    <td className="product-category">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="product-price">${product.price?.toFixed(2) || '0.00'}</td>
                    <td className="product-description">
                      {product.description ? 
                        (product.description.length > 50 ? 
                          product.description.substring(0, 50) + '...' : 
                          product.description
                        ) : 
                        'No description'
                      }
                    </td>
                    <td className="product-actions">
                      <button 
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(product)}
                        title="Edit this product (opens form at top)"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product._id)}
                        title="Delete this product permanently"
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

export default AdminProducts;
