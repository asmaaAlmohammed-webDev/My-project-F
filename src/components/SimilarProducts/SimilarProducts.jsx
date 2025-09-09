import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import SimilarProductsService from '../../services/similarProductsService';
import BookComponent from '../BookComponent/BookComponent';
import { getProductImageUrl } from '../../utils/imageUtils';
import './SimilarProducts.css';

const SimilarProducts = ({ productId, currentProduct, onProductClick }) => {
  const { t, i18n } = useTranslation();
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [algorithm, setAlgorithm] = useState('');

  useEffect(() => {
    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId]);

  const fetchSimilarProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SimilarProductsService.getSimilarProducts(productId, 6);
      
      if (response.status === 'success' && response.data.products) {
        // Format products for BookComponent compatibility
        const formattedProducts = response.data.products.map(product => ({
          _id: product._id,
          id: product._id,
          title: product.name,
          name: product.name,
          author: i18n.language === "ar" ? (product.author_ar || product.author_en || product.categoryId?.name || 'Unknown Category') : (product.author_en || product.author_ar || product.categoryId?.name || 'Unknown Category'),
          category: product.categoryId?.name || 'Uncategorized',
          price: product.price,
          coverImage: getProductImageUrl(product),
          image: getProductImageUrl(product),
          description: product.description,
          rating: 4.5, // Default rating
          similarityScore: product.similarityScore,
          clusterInfo: product.clusterInfo,
          // Additional fields for cart compatibility
          stock: product.stock || 0
        }));

        setSimilarProducts(formattedProducts);
        setAlgorithm(response.data.algorithm);
      }
    } catch (err) {
      console.error('Error fetching similar products:', err);
      setError(t('errorLoadingSimilarProducts') || 'Failed to load similar products');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no product ID or no similar products found
  if (!productId || (!loading && similarProducts.length === 0)) {
    return null;
  }

  return (
    <div className="similar-products-section">
      <div className="similar-products-header">
        <h3 className="similar-products-title">
          {t('similarProducts') || 'Similar Books You Might Like'}
        </h3>
        {algorithm === 'k-means-clustering' && (
          <div className="ai-badge">
            <span className="ai-icon">🤖</span>
            <span className="ai-text">{t('aiRecommended') || 'AI Recommended'}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="similar-products-loading">
          <div className="loading-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="loading-card">
                <div className="loading-image"></div>
                <div className="loading-text"></div>
                <div className="loading-text short"></div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="similar-products-error">
          <p>{error}</p>
          <button onClick={fetchSimilarProducts} className="retry-button">
            {t('retry') || 'Try Again'}
          </button>
        </div>
      ) : (
        <div className="similar-products-grid">
          {similarProducts.map((product) => (
            <div key={product._id} className="similar-product-item">
              <BookComponent
                id={product._id}
                title={product.title}
                author={i18n.language === "ar" ? (product.author_ar || product.author_en || product.author) : (product.author_en || product.author_ar || product.author)}
                category={product.category}
                price={product.price}
                coverImage={product.coverImage}
                description={product.description}
                product={product}
                showQuickActions={true}
                onBookClick={onProductClick}
              />
              
              {/* Similarity indicator */}
              {product.similarityScore && (
                <div className="similarity-indicator">
                  <div className="similarity-bar">
                    <div 
                      className="similarity-fill" 
                      style={{ width: `${product.similarityScore * 100}%` }}
                    ></div>
                  </div>
                  <span className="similarity-text">
                    {SimilarProductsService.formatSimilarityScore(product.similarityScore)} {t('similar') || 'similar'}
                  </span>
                </div>
              )}

              {/* Reason tooltip */}
              {product.clusterInfo && (
                <div className="similarity-reason">
                  <span className="reason-icon">ℹ️</span>
                  <div className="reason-tooltip">
                    {SimilarProductsService.getSimilarityReason(
                      product.clusterInfo, 
                      t('currentLanguage') || 'en'
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarProducts;
