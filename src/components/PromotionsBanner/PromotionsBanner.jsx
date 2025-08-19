import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PromotionService from '../../services/promotionService';
import './PromotionsBanner.css';

const PromotionsBanner = ({ orderAmount = 0, onPromotionSelect }) => {
  const { t, i18n } = useTranslation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  
  useEffect(() => {
    fetchPromotions();
  }, [orderAmount]);

  useEffect(() => {
    // Auto-slide carousel
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % promotions.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [promotions.length]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      
      if (token) {
        // User is logged in - get personalized promotions
        const response = await PromotionService.getUserPromotions(orderAmount);
        setPromotions(response.data?.promotions || []);
        setUserInfo(response.data?.userInfo || null);
      } else {
        // Guest user - get first-time buyer promotions
        const response = await PromotionService.getFirstTimeBuyerPromotions();
        setPromotions(response.data?.promotions || []);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      // If there's an error, try fallback to first-time buyer promotions
      try {
        const fallbackResponse = await PromotionService.getFirstTimeBuyerPromotions();
        setPromotions(fallbackResponse.data?.promotions || []);
        setUserInfo(null);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setPromotions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionClick = (promotion) => {
    if (onPromotionSelect) {
      onPromotionSelect(promotion);
    }
  };

  const formatDiscountDisplay = (promotion) => {
    return PromotionService.formatDiscountDisplay(
      promotion.discountType,
      promotion.discountValue,
      promotion.maxDiscountAmount
    );
  };

  const calculateSavings = (promotion) => {
    return PromotionService.calculateDiscountAmount(
      orderAmount,
      promotion.discountType,
      promotion.discountValue,
      promotion.maxDiscountAmount
    );
  };

  const getLoyaltyTierDisplay = () => {
    if (!userInfo) return null;
    
    const tierInfo = PromotionService.getLoyaltyTierInfo(userInfo.loyaltyTier);
    
    return (
      <div className="loyalty-tier-display">
        <div className="tier-badge" style={{ backgroundColor: tierInfo.color }}>
          <span className="tier-name">{t(`loyaltyTier${tierInfo.name}`)}</span>
        </div>
        <div className="tier-info">
          <span className="points">{userInfo.loyaltyPoints} {t('points')}</span>
          {tierInfo.nextTier && (
            <span className="next-tier">
              ${tierInfo.spending - userInfo.totalSpent} {t('toNextTier')}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="promotions-banner loading">
        <div className="loading-spinner"></div>
        <span>{t('loadingPromotions')}</span>
      </div>
    );
  }

  if (promotions.length === 0) {
    return null; // Don't show banner if no promotions
  }

  return (
    <div className={`promotions-banner ${i18n.dir()}`}>
      {/* Loyalty Tier Display */}
      {userInfo && getLoyaltyTierDisplay()}
      
      {/* Promotions Carousel */}
      <div className="promotions-carousel">
        <div className="carousel-container">
          {promotions.map((promotion, index) => (
            <div
              key={promotion._id}
              className={`promotion-slide ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handlePromotionClick(promotion)}
            >
              <div className="promotion-content">
                <div className="promotion-icon">
                  {promotion.type === 'first_time_buyer' && '🎉'}
                  {promotion.type === 'loyalty_tier' && '👑'}
                  {promotion.type === 'special_campaign' && '🔥'}
                  {promotion.type === 'seasonal' && '🎊'}
                  {promotion.type === 'bulk_discount' && '📦'}
                </div>
                
                <div className="promotion-details">
                  <h3 className="promotion-title">{promotion.name}</h3>
                  <p className="promotion-description">{promotion.description}</p>
                  
                  <div className="promotion-value">
                    <span className="discount">{formatDiscountDisplay(promotion)}</span>
                    {orderAmount > 0 && (
                      <span className="savings">
                        {t('save')} ${calculateSavings(promotion).toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {promotion.promoCode && (
                    <div className="promo-code">
                      <span className="code-label">{t('code')}:</span>
                      <span className="code-value">{promotion.promoCode}</span>
                    </div>
                  )}
                  
                  {promotion.minOrderAmount > 0 && (
                    <div className="minimum-order">
                      {t('minimumOrder')}: ${promotion.minOrderAmount}
                    </div>
                  )}
                </div>
                
                <div className="promotion-action">
                  <button className="apply-btn">
                    {promotion.autoApply ? t('autoApplied') : t('applyNow')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Carousel Indicators */}
        {promotions.length > 1 && (
          <div className="carousel-indicators">
            {promotions.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        )}
        
        {/* Carousel Navigation */}
        {promotions.length > 1 && (
          <>
            <button
              className="carousel-nav prev"
              onClick={() => setCurrentSlide((prev) => 
                prev === 0 ? promotions.length - 1 : prev - 1
              )}
            >
              ‹
            </button>
            <button
              className="carousel-nav next"
              onClick={() => setCurrentSlide((prev) => 
                (prev + 1) % promotions.length
              )}
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PromotionsBanner;
