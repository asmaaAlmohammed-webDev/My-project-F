import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PromotionService from '../../services/promotionService';
import './DiscountDisplay.css';

const DiscountDisplay = ({ 
  cartItems = [], 
  subtotal = 0, 
  onDiscountApplied, 
  appliedPromotions = [] 
}) => {
  const { t, i18n } = useTranslation();
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [showPromotions, setShowPromotions] = useState(false);

  useEffect(() => {
    if (subtotal > 0) {
      fetchAvailablePromotions();
    }
  }, [subtotal]);

  const fetchAvailablePromotions = async () => {
    try {
      const response = await PromotionService.getUserPromotions(subtotal);
      setAvailablePromotions(response.data.promotions || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setError(t('pleaseEnterPromoCode'));
      return;
    }

    // Check if already applied
    const alreadyApplied = appliedPromotions.some(p => 
      p.promoCode && p.promoCode.toUpperCase() === promoCode.toUpperCase()
    );

    if (alreadyApplied) {
      setError(t('promoCodeAlreadyApplied'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await PromotionService.validatePromotion(
        promoCode, 
        cartItems, 
        subtotal
      );

      if (response.data.valid) {
        const promotionData = {
          promotionId: response.data.promotion.id,
          promoCode: response.data.promotion.promoCode,
          discountAmount: response.data.discountAmount,
          discountType: response.data.promotion.discountType
        };

        if (onDiscountApplied) {
          onDiscountApplied(promotionData);
        }

        setSuccess(t('promoCodeAppliedSuccessfully'));
        setPromoCode('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || t('invalidPromoCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePromotion = (promotionToRemove) => {
    if (onDiscountApplied) {
      onDiscountApplied(null, promotionToRemove);
    }
  };

  const handleQuickApply = async (promotion) => {
    // Check if already applied
    const alreadyApplied = appliedPromotions.some(p => 
      p.promotionId === promotion._id
    );

    if (alreadyApplied) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const discountAmount = PromotionService.calculateDiscountAmount(
        subtotal,
        promotion.discountType,
        promotion.discountValue,
        promotion.maxDiscountAmount
      );

      const promotionData = {
        promotionId: promotion._id,
        promoCode: promotion.promoCode || 'AUTO',
        discountAmount,
        discountType: promotion.discountType
      };

      if (onDiscountApplied) {
        onDiscountApplied(promotionData);
      }

      setSuccess(t('promotionAppliedSuccessfully'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(t('errorApplyingPromotion'));
    } finally {
      setLoading(false);
    }
  };

  const getTotalDiscount = () => {
    return appliedPromotions.reduce((total, promo) => total + (promo.discountAmount || 0), 0);
  };

  const formatDiscountDisplay = (promotion) => {
    return PromotionService.formatDiscountDisplay(
      promotion.discountType,
      promotion.discountValue,
      promotion.maxDiscountAmount
    );
  };

  return (
    <div className={`discount-display ${i18n.dir()}`}>
      {/* Applied Promotions */}
      {appliedPromotions.length > 0 && (
        <div className="applied-promotions">
          <h4 className="section-title">{t('appliedPromotions')}</h4>
          {appliedPromotions.map((promotion, index) => (
            <div key={index} className="applied-promotion">
              <div className="promotion-info">
                <span className="promo-code">{promotion.promoCode}</span>
                <span className="discount-amount">
                  -${promotion.discountAmount.toFixed(2)}
                </span>
              </div>
              <button
                className="remove-btn"
                onClick={() => handleRemovePromotion(promotion)}
                title={t('removePromotion')}
              >
                ×
              </button>
            </div>
          ))}
          
          <div className="total-savings">
            <strong>
              {t('totalSavings')}: ${getTotalDiscount().toFixed(2)}
            </strong>
          </div>
        </div>
      )}

      {/* Promo Code Input */}
      <div className="promo-code-section">
        <h4 className="section-title">{t('promoCode')}</h4>
        <div className="promo-input-group">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder={t('enterPromoCode')}
            className="promo-input"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleApplyPromoCode();
              }
            }}
          />
          <button
            onClick={handleApplyPromoCode}
            disabled={loading || !promoCode.trim()}
            className="apply-btn"
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              t('apply')
            )}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>

      {/* Available Promotions */}
      {availablePromotions.length > 0 && (
        <div className="available-promotions">
          <button
            className="toggle-promotions"
            onClick={() => setShowPromotions(!showPromotions)}
          >
            {showPromotions ? '▼' : '▶'} {t('availablePromotions')} ({availablePromotions.length})
          </button>

          {showPromotions && (
            <div className="promotions-list">
              {availablePromotions.map((promotion) => {
                const isApplied = appliedPromotions.some(p => p.promotionId === promotion._id);
                const discountAmount = PromotionService.calculateDiscountAmount(
                  subtotal,
                  promotion.discountType,
                  promotion.discountValue,
                  promotion.maxDiscountAmount
                );

                return (
                  <div 
                    key={promotion._id} 
                    className={`promotion-item ${isApplied ? 'applied' : ''}`}
                  >
                    <div className="promotion-details">
                      <div className="promotion-name">{promotion.name}</div>
                      <div className="promotion-discount">
                        {formatDiscountDisplay(promotion)}
                      </div>
                      <div className="promotion-savings">
                        {t('save')} ${discountAmount.toFixed(2)}
                      </div>
                      {promotion.minOrderAmount > 0 && (
                        <div className="minimum-order">
                          {t('minimumOrder')}: ${promotion.minOrderAmount}
                        </div>
                      )}
                    </div>
                    
                    {!isApplied && (
                      <button
                        className="quick-apply-btn"
                        onClick={() => handleQuickApply(promotion)}
                        disabled={loading}
                      >
                        {t('apply')}
                      </button>
                    )}
                    
                    {isApplied && (
                      <span className="applied-badge">{t('applied')}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscountDisplay;
