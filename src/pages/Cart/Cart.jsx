import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaShoppingCart,
  FaHistory,
} from "react-icons/fa";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { getCartItems, updateCartItemQuantity, removeFromCart, clearCart } from "../../utils/cartUtils";
import PromotionService from "../../services/promotionService";
import InvoiceViewer from "../../components/InvoiceViewer/InvoiceViewer";
import "./Cart.css";

const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // حالة سلة التسوق الحالية - will be populated from localStorage initially
  const [cartItems, setCartItems] = useState([]);

  // حالة الطلبات السابقة - will be fetched from backend
  const [pastOrders, setPastOrders] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);

  // حالة لعرض/إخفاء الطلبات السابقة
  const [showPastOrders, setShowPastOrders] = useState(false);

  // حالة للتحرير
  const [editingItem, setEditingItem] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState(1);

  // حالة عنوان التسليم
  const [address, setAddress] = useState({
    street: "",
    region: "",
    descreption: "",
  });

  // حالة طريقة الدفع
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // State for successful order
  const [successfulOrderId, setSuccessfulOrderId] = useState(null);

  // State for invoice viewer
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);

  // State for auto promotions
  const [autoPromotions, setAutoPromotions] = useState([]);
  const [promotionsLoading, setPromotionsLoading] = useState(false);

  // State for manual promotions
  const [manualPromotions, setManualPromotions] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState('');

  // Debounce timer for order history loading
  const [orderLoadTimer, setOrderLoadTimer] = useState(null);

  // Handle invoice viewing
  const handleViewInvoice = (orderId) => {
    setSuccessfulOrderId(orderId);
    setShowInvoiceViewer(true);
  };

  const handleCloseInvoiceViewer = () => {
    setShowInvoiceViewer(false);
  };

  const handleContinueShopping = () => {
    navigate("/shop");
  };

  // Load cart from localStorage on component mount
  useEffect(() => {
    setCartItems(getCartItems());
    
    // Load manually applied promotions from localStorage
    const savedPromotions = JSON.parse(localStorage.getItem('appliedPromotions') || '[]');
    setManualPromotions(savedPromotions);
    // Load user's order history with debouncing to prevent rate limiting
    debouncedLoadOrderHistory();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      setCartItems(getCartItems());
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      // Clear any pending timer on cleanup
      if (orderLoadTimer) {
        clearTimeout(orderLoadTimer);
      }
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch auto promotions when cart changes
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal > 0) {
      fetchAutoPromotions(subtotal);
    } else {
      setAutoPromotions([]);
    }
  }, [cartItems]);

  // Fetch auto-applicable promotions
  const fetchAutoPromotions = async (orderAmount) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAutoPromotions([]);
      return;
    }

    setPromotionsLoading(true);
    try {
      const response = await PromotionService.getAutoPromotions(orderAmount);
      setAutoPromotions(response.data?.autoPromotions || []);
    } catch (error) {
      console.error('Error fetching auto promotions:', error);
      setAutoPromotions([]);
    } finally {
      setPromotionsLoading(false);
    }
  };

  // Apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPromoCodeError('Please login to apply promo codes');
      return;
    }

    // Check if promo code is already applied
    const alreadyApplied = manualPromotions.some(p => 
      p.promoCode && p.promoCode.toUpperCase() === promoCode.toUpperCase()
    );
    
    if (alreadyApplied) {
      setPromoCodeError('This promo code is already applied');
      return;
    }

    setPromoCodeLoading(true);
    setPromoCodeError('');
    
    try {
      const response = await PromotionService.applyPromotion(
        promoCode,
        subtotal,
        cartItems.map(item => ({ productId: item.id, amount: item.quantity, price: item.price }))
      );
      
      if (response.status === 'success' && response.data) {
        const promotion = response.data.promotion;
        const newPromotion = {
          _id: promotion.id,
          name: promotion.name,
          promoCode: promotion.promoCode,
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          maxDiscountAmount: promotion.maxDiscountAmount,
          discountAmount: response.data.discountAmount,
          appliedAt: new Date().toISOString()
        };
        
        const updatedPromotions = [...manualPromotions, newPromotion];
        setManualPromotions(updatedPromotions);
        localStorage.setItem('appliedPromotions', JSON.stringify(updatedPromotions));
        setPromoCode('');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPromoCodeError(
        error.response?.data?.message || 'Invalid or expired promo code'
      );
    } finally {
      setPromoCodeLoading(false);
    }
  };

  // Remove manual promotion
  const removePromotion = (promotionId) => {
    const updatedPromotions = manualPromotions.filter(p => p._id !== promotionId);
    setManualPromotions(updatedPromotions);
    localStorage.setItem('appliedPromotions', JSON.stringify(updatedPromotions));
  };

  // Clear all manual promotions
  const clearAllPromotions = () => {
    setManualPromotions([]);
    localStorage.removeItem('appliedPromotions');
  };

  // Note: Cart items are managed by cartUtils, no need to save here
  // localStorage management is handled in cartUtils.js functions

  // Debounced version of loadOrderHistory to prevent rate limiting
  const debouncedLoadOrderHistory = () => {
    // Clear any existing timer
    if (orderLoadTimer) {
      clearTimeout(orderLoadTimer);
    }

    // Set a new timer
    const newTimer = setTimeout(() => {
      loadOrderHistory();
    }, 1000);

    setOrderLoadTimer(newTimer);
  };
  const loadOrderHistory = async () => {
    // Prevent multiple simultaneous calls
    if (orderHistoryLoading) {
      console.log("Order history already loading, skipping...");
      return;
    }

    setOrderHistoryLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping order history load");
        setOrderHistoryLoading(false);
        return;
      }

      // Try using the /mien endpoint as defined in backend
      const response = await axios.get(`${API_ENDPOINTS.ORDERS}/mien`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Order history response:", response.data);
      // Ensure we handle different response structures and validate order data
      const orders =
        response.data.doc || response.data.data || response.data || [];
      // Filter and validate orders to ensure they have required properties
      const validOrders = orders.filter(
        (order) => order && (order._id || order.id)
      );
      setPastOrders(validOrders);
    } catch (err) {
      console.error("Error loading order history:", err);

      // Handle rate limiting specifically
      if (err.response?.status === 429) {
        console.warn("Rate limited - will try again later");
        setPastOrders([]);
        setOrderHistoryLoading(false);
        return;
      }

      // If /mien doesn't work, try the regular orders endpoint
      if (err.response?.status === 403 || err.response?.status === 404) {
        try {
          const token = localStorage.getItem("token");
          const fallbackResponse = await axios.get(API_ENDPOINTS.ORDERS, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("Fallback order response:", fallbackResponse.data);
          // Ensure we handle different response structures and validate order data
          const fallbackOrders =
            fallbackResponse.data.doc ||
            fallbackResponse.data.data ||
            fallbackResponse.data ||
            [];
          // Filter and validate orders to ensure they have required properties
          const validFallbackOrders = fallbackOrders.filter(
            (order) => order && (order._id || order.id)
          );
          setPastOrders(validFallbackOrders);
        } catch (fallbackErr) {
          console.error("Fallback order loading also failed:", fallbackErr);
          // Set empty array if both fail
          setPastOrders([]);
        }
      } else {
        // For other errors, just set empty array
        setPastOrders([]);
      }
    } finally {
      setOrderHistoryLoading(false);
    }
  };

  // حساب المجموع الفرعي
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate total discount from both auto and manual promotions
  const autoDiscount = autoPromotions.reduce(
    (sum, promo) => sum + (promo.discountAmount || 0),
    0
  );
  
  const manualDiscount = manualPromotions.reduce(
    (sum, promo) => sum + (promo.discountAmount || 0),
    0
  );
  
  const totalDiscount = autoDiscount + manualDiscount;

  // الضريبة (10% فرضاً) - applied after discount
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const tax = discountedSubtotal * 0.1;

  // التكلفة الإجمالية
  const total = discountedSubtotal + tax;

  // دالة حذف عنصر من السلة
  const removeItem = (id) => {
    const updatedCart = removeFromCart(id);
    setCartItems(updatedCart);
  };

  // دالة تحديث الكمية
  const updateQuantity = (id, newQuantity) => {
    const updatedCart = updateCartItemQuantity(id, newQuantity);
    setCartItems(updatedCart);
  };

  // دالة بدء التحرير
  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditedQuantity(item.quantity);
  };

  // دالة حفظ التعديل
  const saveEdit = () => {
    updateQuantity(editingItem, editedQuantity);
    setEditingItem(null);
    setEditedQuantity(1);
  };

  // دالة إلغاء التحرير
  const cancelEdit = () => {
    setEditingItem(null);
  };

  // دالة الدفع والطلب - Connect to backend
  const checkout = async () => {
    if (cartItems.length === 0) {
      setError(t("cartIsEmpty"));
      return;
    }

    if (!address.street || !address.region || !address.descreption) {
      setError("Please fill in all address fields!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to place an order");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare order data for backend according to Order model schema
      const orderData = {
        cart: cartItems.map((item) => ({
          productId: item.id || item._id,
          amount: item.quantity,
          price: item.price,
        })),
        subtotal: subtotal, // Include subtotal for promotion calculations
        total: total,
        status: "wating", // Use valid enum value instead of "PENDING"
        methodePayment: paymentMethod, // Use selected payment method
        address: address, // Use the address from the form
        appliedPromotions: [
          // Auto-applied promotions
          ...autoPromotions.map(promo => ({
            promotionId: promo.promotion._id,
            name: promo.promotion.name,
            discountAmount: promo.discountAmount,
            type: 'auto'
          })),
          // Manual promotions
          ...manualPromotions.map(promo => ({
            promotionId: promo._id,
            name: promo.name,
            promoCode: promo.promoCode,
            discountAmount: promo.discountAmount,
            type: 'manual'
          }))
        ]
      };

      // Create order via API
      const response = await axios.post(API_ENDPOINTS.ORDERS, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Success - clear cart and show message
      clearCart(); // Use utility function that dispatches cartUpdated event
      setCartItems([]); // Update local state
      
      // Clear applied promotions
      clearAllPromotions();
      
      setMessage(t("successOrder"));

      // Store the successful order ID for invoice download
      if (response.data && response.data.doc && response.data.doc._id) {
        setSuccessfulOrderId(response.data.doc._id);
      }

      // Clear address form
      setAddress({
        street: "",
        region: "",
        descreption: "",
      });

      // Reload order history to show the new order with debouncing to prevent rate limiting
      debouncedLoadOrderHistory();
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.message || t("errorOrder"));
    } finally {
      setLoading(false);
    }
  };

  // Utility function to add item to cart (can be called from other components)
  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.find(
      (item) => (item.id || item._id) === (product.id || product._id)
    );

    if (existingItem) {
      // Update quantity if item already exists
      updateQuantity(
        existingItem.id || existingItem._id,
        existingItem.quantity + quantity
      );
    } else {
      // Add new item to cart
      const cartItem = {
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image:
          product.image ||
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
        author: product.author || "Unknown Author",
      };
      const newCartItems = [...cartItems, cartItem];
      setCartItems(newCartItems);
      localStorage.setItem("cart", JSON.stringify(newCartItems));

      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
  };

  return (
    <div className="cart-page">
      {/* Invoice Viewer Modal */}
      {showInvoiceViewer && successfulOrderId && (
        <InvoiceViewer
          orderId={successfulOrderId}
          onClose={handleCloseInvoiceViewer}
        />
      )}

      <div className="cart-container">
        <div className="cart-header">
          <h1>
            <FaShoppingCart /> {t("cart")}
          </h1>
        </div>

        {/* Display messages */}
        {message && (
          <div
            className="success-message"
            style={{
              background: "#d4edda",
              color: "#155724",
              padding: "1rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            {message}
            {successfulOrderId && (
              <div
                className="invoice-download-section"
                style={{ marginTop: "1rem" }}
              >
                <p style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                  {t("orderSuccessInvoice") ||
                    "Your order has been placed successfully! View your invoice:"}
                </p>
                <button
                  onClick={() => handleViewInvoice(successfulOrderId)}
                  className="invoice-btn"
                  style={{
                    background: "#8e44ad",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  {t("viewInvoice") || "View Invoice"}
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div
            className="error-message"
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "1rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <div className="cart-content">
          <h2 className="section-title">{t("currentOrder")}</h2>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>{t("cartIsEmpty")}</p>
              <button
                className="btn continue-shopping"
                onClick={handleContinueShopping}
              >
                {t("continueShopping")}
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h3 className="item-title">{item.name}</h3>
                      <p className="item-author">
                        {t("author")}: {item.author}
                      </p>

                      {editingItem === item.id ? (
                        <div className="edit-quantity">
                          <button
                            onClick={() =>
                              setEditedQuantity((prev) => Math.max(1, prev - 1))
                            }
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={editedQuantity}
                            onChange={(e) =>
                              setEditedQuantity(parseInt(e.target.value) || 1)
                            }
                            min="1"
                          />
                          <button
                            onClick={() =>
                              setEditedQuantity((prev) => prev + 1)
                            }
                            className="quantity-btn"
                          >
                            +
                          </button>
                          <div className="edit-actions">
                            <button onClick={saveEdit} className="btn save-btn">
                              {t("save")}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="btn cancel-btn"
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="item-quantity">
                          <span>
                            {t("amount")}: {item.quantity}
                          </span>
                          <div className="item-actions">
                            <button
                              onClick={() => startEditing(item)}
                              className="btn edit-btn"
                            >
                              <FaEdit /> {t("edit")}
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="btn remove-btn"
                            >
                              <FaTrash /> {t("delete")}
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="item-price">
                        {t("price")}: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ملخص الطلب */}
              <div className="order-summary">
                <h3>{t("orderSummary")}</h3>
                <div className="summary-row">
                  <span>{t("subTotal")}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {/* Auto Promotions Section */}
                {promotionsLoading && (
                  <div className="summary-row promotion-loading">
                    <span>{t("loadingPromotions") || "Loading promotions..."}</span>
                    <span>...</span>
                  </div>
                )}
                
                {autoPromotions.length > 0 && (
                  <div className="promotions-section">
                    <h4 style={{ margin: '10px 0 5px 0', fontSize: '14px', color: '#27ae60' }}>
                      🎉 {t("autoAppliedPromotions") || "Auto Applied Promotions"}
                    </h4>
                    {autoPromotions.map((promo, index) => (
                      <div key={index} className="summary-row promotion-discount">
                        <span style={{ fontSize: '13px', color: '#27ae60' }}>
                          {promo.promotion?.name || "Gold Member Discount"}
                        </span>
                        <span style={{ color: '#27ae60' }}>
                          -${(promo.discountAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual Promotions Section */}
                {manualPromotions.length > 0 && (
                  <div className="promotions-section">
                    <h4 style={{ margin: '10px 0 5px 0', fontSize: '14px', color: '#e67e22' }}>
                      🏷️ {t("appliedPromoCodes") || "Applied Promo Codes"}
                    </h4>
                    {manualPromotions.map((promo, index) => (
                      <div key={index} className="summary-row promotion-discount">
                        <span style={{ fontSize: '13px', color: '#e67e22' }}>
                          {promo.name} ({promo.promoCode})
                          <button 
                            onClick={() => removePromotion(promo._id)}
                            style={{ 
                              marginLeft: '5px', 
                              background: 'none', 
                              border: 'none', 
                              color: '#e74c3c', 
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Remove promotion"
                          >
                            ✖
                          </button>
                        </span>
                        <span style={{ color: '#e67e22' }}>
                          -${(promo.discountAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Promo Code Input Section */}
                <div className="promo-code-section" style={{ margin: '15px 0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                    {t("promoCode") || "Promo Code"}
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoCodeError('');
                        }}
                        placeholder={t("enterPromoCode") || "Enter promo code"}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: promoCodeError ? '1px solid #e74c3c' : '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        disabled={promoCodeLoading}
                      />
                      {promoCodeError && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>
                          {promoCodeError}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={applyPromoCode}
                      disabled={promoCodeLoading || !promoCode.trim()}
                      style={{
                        padding: '8px 16px',
                        background: promoCodeLoading ? '#bdc3c7' : '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: promoCodeLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {promoCodeLoading ? t("applying") || "Applying..." : t("apply") || "Apply"}
                    </button>
                  </div>
                  {manualPromotions.length > 0 && (
                    <button
                      onClick={clearAllPromotions}
                      style={{
                        marginTop: '10px',
                        padding: '5px 10px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {t("clearAllPromotions") || "Clear All Promo Codes"}
                    </button>
                  )}
                </div>

                {/* Total Discount Summary */}
                {totalDiscount > 0 && (
                  <div className="summary-row">
                    <span style={{ fontWeight: 'bold', color: '#27ae60' }}>
                      {t("totalDiscount") || "Total Discount"}
                    </span>
                    <span style={{ fontWeight: 'bold', color: '#27ae60' }}>
                      -${totalDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                {totalDiscount > 0 && (
                  <div className="summary-row">
                    <span style={{ fontWeight: 'bold' }}>{t("afterDiscount") || "After Discount"}</span>
                    <span style={{ fontWeight: 'bold' }}>${discountedSubtotal.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="summary-row">
                  <span>{t("tax")}</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>{t("total")}</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* Delivery Address Form */}
                <div className="address-section">
                  <h4>{t("deliveryAddress")}</h4>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder={t("streetAddress")}
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      className="address-input"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder={t("regionCity")}
                      value={address.region}
                      onChange={(e) =>
                        setAddress({ ...address, region: e.target.value })
                      }
                      className="address-input"
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      placeholder={t("additionalDetails")}
                      value={address.descreption}
                      onChange={(e) =>
                        setAddress({ ...address, descreption: e.target.value })
                      }
                      className="address-input"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="payment-section">
                  <h4>{t("paymentMethod")}</h4>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>{t("cashOnDelivery")}</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        value="bank"
                        checked={paymentMethod === "bank"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>{t("bankTransfer")}</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={checkout}
                  className="btn checkout-btn"
                  disabled={loading || cartItems.length === 0}
                >
                  {loading ? t("processing") : t("completePurchase")}
                </button>
              </div>
            </>
          )}
        </div>

        {/* الطلبات السابقة */}
        <div className="past-orders-section">
          <div
            className="section-header"
            onClick={() => setShowPastOrders(!showPastOrders)}
          >
            <h2 className="section-title">
              <FaHistory />
              {t("previousOrders")}
            </h2>
            <span className="toggle-icon">
              {showPastOrders ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>

          {showPastOrders && (
            <div className="past-orders">
              {orderHistoryLoading ? (
                <div className="loading-orders">
                  <p>{t("loadingOrderHistory")}</p>
                </div>
              ) : pastOrders.length === 0 ? (
                <p className="no-orders">{t("noPreviousOrders")}</p>
              ) : (
                pastOrders.map((order) => (
                  <div key={order._id || order.id} className="past-order">
                    <div className="order-header">
                      <div>
                        <span className="order-id">
                          {t("order")}: {order._id || order.id}
                        </span>
                        <span className="order-date">
                          {t("date")}:{" "}
                          {new Date(
                            order.createdAt || order.date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="order-total">
                          {t("orderTotal")}: ${(order.total || 0).toFixed(2)}
                        </span>
                        <span
                          className={`order-status ${
                            order.status === "DELIVERED" ||
                            order.status === "تم التوصيل"
                              ? "delivered"
                              : "processing"
                          }`}
                        >
                          {order.status || t("pending")}
                        </span>
                      </div>
                    </div>

                    <div className="order-items">
                      {(order.items || []).map((item, index) => (
                        <div
                          key={item.id || item._id || index}
                          className="order-item"
                        >
                          <span className="item-name">
                            {item.name || t("unknownItem")}
                          </span>
                          <span className="item-quantity">
                            {t("amount")}: {item.quantity || 0}
                          </span>
                          <span className="item-price">
                            $
                            {((item.price || 0) * (item.quantity || 0)).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <div className="no-items">{t("noItemsOrder")}</div>
                      )}
                    </div>

                    {/* Invoice Download Section */}
                    <div className="order-invoice-section">
                      <button
                        onClick={() => handleViewInvoice(order._id || order.id)}
                        className="invoice-btn"
                        style={{
                          background: "#8e44ad",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        {t("viewInvoice") || "View Invoice"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
