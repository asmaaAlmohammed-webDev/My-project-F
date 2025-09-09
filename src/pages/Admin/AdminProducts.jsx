import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchProductsForAdmin, fetchCategories } from '../../services/productService';
import { getProductImageUrl } from '../../utils/imageUtils';
import { getLocalizedContent } from '../../utils/languageUtils';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import './AdminProducts.css';
// ADDED: Translation hook
import { useTranslation } from 'react-i18next';

const AdminProducts = () => {
  // ADDED: Translation hook
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    author_en: '',
    author_ar: '',
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

  // Fetch products and categories on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        fetchProductsForAdmin(), // CHANGED: Use admin endpoint to get description_en and description_ar
        fetchCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError(t('failedLoadData'));
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
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 1
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
      setError(err.response?.data?.message || t('failedSaveProduct'));
      console.error('Error saving product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    console.log('Editing product:', product); // Debug log to see the product structure
    
    setEditingProduct(product);
    
    // Extract categoryId properly - handle both populated and non-populated cases
    let categoryId = '';
    if (product.categoryId) {
      if (typeof product.categoryId === 'string') {
        // Direct string ID
        categoryId = product.categoryId;
      } else if (product.categoryId._id) {
        // Populated object with _id
        categoryId = product.categoryId._id;
      } else if (product.categoryId.name) {
        // Backend is populating category but excluding _id, so we need to find the category by name
        const matchingCategory = categories.find(cat => cat.name === product.categoryId.name);
        if (matchingCategory) {
          categoryId = matchingCategory._id;
          console.log('Found matching category by name:', matchingCategory.name, 'with ID:', categoryId);
        }
      }
    }
    
    console.log('Final extracted categoryId:', categoryId); // Debug log
    console.log('Description EN:', product.description_en); // Debug descriptions
    console.log('Description AR:', product.description_ar); // Debug descriptions
    
    const formDataToSet = {
      name: product.name || '',
      author_en: product.author_en || '',
      author_ar: product.author_ar || '',
      description_en: product.description_en || '',
      description_ar: product.description_ar || '',
      price: product.price ? product.price.toString() : '',
      image: product.image || '',
      categoryId: categoryId,
      stock: product.stock !== undefined ? product.stock.toString() : '0',
      minStockLevel: product.minStockLevel !== undefined ? product.minStockLevel.toString() : '1',
      publisherEmail: product.publisherEmail || ''
    };
    
    console.log('Form data being set:', formDataToSet); // Debug complete form data
    
    setFormData(formDataToSet);
    setShowForm(true);
    
    // Scroll to top smoothly so user can see the edit form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t('confirmDeleteProduct'))) {
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
      setError(err.response?.data?.message || t('failedDeleteProduct'));
      console.error('Error deleting product:', err);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      author_en: '',
      author_ar: '',
      description_en: '', 
      description_ar: '', 
      price: '', 
      image: '', 
      categoryId: '',
      stock: '',
      minStockLevel: '',
      publisherEmail: ''
    });
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
      return translateCategoryName(categoryId.name);
    }
    const category = categories.find(cat => cat._id === categoryId);
    return category ? translateCategoryName(category.name) : t('unknown');
  };

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

  // Helper function to get the correct image URL
  const getImageSrc = (imageValue) => {
    return getProductImageUrl({ image: imageValue });
  };

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="loading-spinner"></div>
        <p>{t('loadingProducts')}</p>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h1>{t('productsManagement')}</h1>
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
          {showForm ? t('cancel') : t('addNewProduct')}
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
          <h2>{editingProduct ? t('editProduct') : t('addNewProduct')}</h2>
          <form onSubmit={handleFormSubmit} className="product-form">
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
                  placeholder={t('enterProductName')}
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="author_en">{t('authorEnglish')} *</label>
                <input
                  type="text"
                  id="author_en"
                  name="author_en"
                  value={formData.author_en}
                  onChange={handleInputChange}
                  required
                  placeholder={t('enterAuthorEnglish')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="author_ar">{t('authorArabic')} *</label>
                <input
                  type="text"
                  id="author_ar"
                  name="author_ar"
                  value={formData.author_ar}
                  onChange={handleInputChange}
                  required
                  placeholder={t('enterAuthorArabic')}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">{t('category')} *</label>
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
              {/* Debug info - remove after testing */}
              {editingProduct && (
                <small style={{color: '#666', fontSize: '11px'}}>
                  Debug: Selected categoryId = "{formData.categoryId}" | Available categories: {categories.length}
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description_en">{t('descriptionEnglish')}</label>
              <textarea
                id="description_en"
                name="description_en"
                value={formData.description_en}
                onChange={handleInputChange}
                placeholder={t('enterDescriptionEnglish')}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description_ar">{t('descriptionArabic')}</label>
              <textarea
                id="description_ar"
                name="description_ar"
                value={formData.description_ar}
                onChange={handleInputChange}
                placeholder={t('enterDescriptionArabic')}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">{t('stockQuantity')}</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder={t('enterStockQuantity')}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="minStockLevel">{t('minimumStockLevel')}</label>
              <input
                type="number"
                id="minStockLevel"
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleInputChange}
                placeholder={t('enterMinimumStock')}
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="publisherEmail">{t('publisherEmail')}</label>
              <input
                type="email"
                id="publisherEmail"
                name="publisherEmail"
                value={formData.publisherEmail}
                onChange={handleInputChange}
                placeholder={t('enterPublisherEmail')}
              />
            </div>

            <ImageUpload
              currentImage={formData.image}
              onImageChange={handleImageChange}
              label={t('productImage')}
              required={false}
            />

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? t('saving') : (editingProduct ? t('updateProduct') : t('createProduct'))}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-section">
        <h2>{t('allProducts')} ({products.length})</h2>
        
        {products.length === 0 ? (
          <div className="no-products">
            <p>{t('noProductsFound')}</p>
          </div>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>{t('image')}</th>
                  <th>{t('name')}</th>
                  <th>{t('category')}</th>
                  <th>{t('price')}</th>
                  <th>{t('stock')}</th>
                  <th>{t('description')}</th>
                  <th>{t('actions')}</th>
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
                        <div className="no-image">{t('noImage')}</div>
                      )}
                    </td>
                    <td className="product-name">{product.name}</td>
                    <td className="product-category">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="product-price">${product.price?.toFixed(2) || '0.00'}</td>
                    <td className="product-stock">
                      <span className={`stock-badge ${
                        product.stock === 0 ? 'out-of-stock' : 
                        product.stock <= (product.minStockLevel || 5) ? 'low-stock' : 
                        'in-stock'
                      }`}>
                        {product.stock || 0} {product.stock === 1 ? t('copy') : t('copies')}
                      </span>
                    </td>
                    <td className="product-description">
                      {(() => {
                        const description = getLocalizedContent(product, 'description');
                        if (!description || description === 'No description available') {
                          return t('noDescription');
                        }
                        return description.length > 50 ? 
                          description.substring(0, 50) + '...' : 
                          description;
                      })()}
                    </td>
                    <td className="product-actions">
                      <button 
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(product)}
                        title={t('editProductTooltip')}
                      >
                        {t('editAction')}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product._id)}
                        title={t('deleteProductTooltip')}
                      >
                        {t('deleteAction')}
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
