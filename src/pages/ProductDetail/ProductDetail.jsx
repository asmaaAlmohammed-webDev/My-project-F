import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchProductById } from '../../services/productService';
import { getProductImageUrl } from '../../utils/imageUtils';
import { addToCart } from '../../utils/cartUtils';
import SimilarProducts from '../../components/SimilarProducts/SimilarProducts';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const productData = await fetchProductById(id);
      setProduct(productData);
      setError(null);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(t('errorLoadingProduct') || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      const productForCart = {
        id: product._id,
        name: product.name,
        price: product.price,
        image: getProductImageUrl(product),
        author: product.categoryId?.name || "Unknown Category",
        category: product.categoryId?.name || "Uncategorized",
        description: product.description
      };

      addToCart(productForCart, quantity);
      
      // Show success message
      alert(t('productAddedToCart') || 'Product added to cart successfully!');
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(t('errorAddingToCart') || 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="product-detail-loading">
          <div className="loading-spinner"></div>
          <p>{t('loadingProduct') || 'Loading product details...'}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="product-detail-error">
          <h2>{t('productNotFound') || 'Product Not Found'}</h2>
          <p>{error || t('productNotFoundMessage') || 'The product you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/shop')} 
            className="btn btn-primary"
          >
            {t('backToShop') || 'Back to Shop'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => navigate('/shop')} className="breadcrumb-link">
          {t('shop') || 'Shop'}
        </button>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="product-detail-main">
        <div className="product-image-section">
          <img 
            src={getProductImageUrl(product)} 
            alt={product.name}
            className="product-main-image"
          />
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            <span className="product-category">
              {t('category')}: {product.categoryId?.name || t('uncategorized')}
            </span>
            <span className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock">
                  ✅ {t('inStock')} ({product.stock} {t('available')})
                </span>
              ) : (
                <span className="out-of-stock">
                  ❌ {t('outOfStock')}
                </span>
              )}
            </span>
          </div>

          <div className="product-price">
            <span className="price-amount">${product.price?.toFixed(2)}</span>
          </div>

          <div className="product-description">
            <h3>{t('description') || 'Description'}</h3>
            <p>{product.description || t('noDescription')}</p>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="quantity-btn"
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (product.stock || 99)}
                className="quantity-btn"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className="add-to-cart-btn"
            >
              {addingToCart ? (
                <span>
                  <div className="btn-spinner"></div>
                  {t('addingToCart') || 'Adding...'}
                </span>
              ) : (
                <>
                  🛒 {t('addToCart') || 'Add to Cart'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🤖 AI-POWERED SIMILAR PRODUCTS SECTION */}
      <div className="similar-products-wrapper">
        <SimilarProducts 
          productId={product._id} 
          currentProduct={product} 
        />
      </div>
    </div>
  );
};

export default ProductDetail;
