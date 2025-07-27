import { useState, useEffect } from "react";
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
import { getCartItems, updateCartItemQuantity, removeFromCart } from "../../utils/cartUtils";
import "./Cart.css";

const CartPage = () => {
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

  // Debounce timer for order history loading
  const [orderLoadTimer, setOrderLoadTimer] = useState(null);

  // Load cart from localStorage on component mount
  useEffect(() => {
    setCartItems(getCartItems());
    
    // Load user's order history with debouncing to prevent rate limiting
    debouncedLoadOrderHistory();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      setCartItems(getCartItems());
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      // Clear any pending timer on cleanup
      if (orderLoadTimer) {
        clearTimeout(orderLoadTimer);
      }
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      const response = await axios.get(
        `${API_ENDPOINTS.ORDERS}/mien`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("Order history response:", response.data);
      // Ensure we handle different response structures and validate order data
      const orders = response.data.doc || response.data.data || response.data || [];
      // Filter and validate orders to ensure they have required properties
      const validOrders = orders.filter(order => order && (order._id || order.id));
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
          const fallbackResponse = await axios.get(
            API_ENDPOINTS.ORDERS,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Fallback order response:", fallbackResponse.data);
          // Ensure we handle different response structures and validate order data
          const fallbackOrders = fallbackResponse.data.doc || fallbackResponse.data.data || fallbackResponse.data || [];
          // Filter and validate orders to ensure they have required properties
          const validFallbackOrders = fallbackOrders.filter(order => order && (order._id || order.id));
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

  // الضريبة (10% فرضاً)
  const tax = subtotal * 0.1;

  // التكلفة الإجمالية
  const total = subtotal + tax;

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
      setError("Your cart is empty!");
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
      // Prepare order data for backend
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id || item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        })),
        total: total,
        subtotal: subtotal,
        tax: tax,
        status: "PENDING"
      };

      // Create order via API
      const response = await axios.post(
        API_ENDPOINTS.ORDERS,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Success - clear cart and show message
      setCartItems([]);
      localStorage.removeItem("cart");
      setMessage("✅ Order placed successfully!");
      
      // Reload order history to show the new order with debouncing to prevent rate limiting
      debouncedLoadOrderHistory();

    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err.response?.data?.message || "❌ Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Utility function to add item to cart (can be called from other components)
  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.find(item => 
      (item.id || item._id) === (product.id || product._id)
    );

    if (existingItem) {
      // Update quantity if item already exists
      updateQuantity(existingItem.id || existingItem._id, existingItem.quantity + quantity);
    } else {
      // Add new item to cart
      const cartItem = {
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
        author: product.author || "Unknown Author"
      };
      setCartItems([...cartItems, cartItem]);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>
            <FaShoppingCart /> سلة التسوق
          </h1>
        </div>

        {/* Display messages */}
        {message && (
          <div className="success-message" style={{ 
            background: '#d4edda', 
            color: '#155724', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
          }}>
            {message}
          </div>
        )}

        {error && (
          <div className="error-message" style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        <div className="cart-content">
          <h2 className="section-title">Current Order</h2>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Cart is empty</p>
              <button className="btn continue-shopping">
                Continue Shopping
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
                      <p className="item-author">Author: {item.author}</p>

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
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="btn cancel-btn"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="item-quantity">
                          <span>amount: {item.quantity}</span>
                          <div className="item-actions">
                            <button
                              onClick={() => startEditing(item)}
                              className="btn edit-btn"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="btn remove-btn"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="item-price">
                        Price: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ملخص الطلب */}
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Sub total:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button onClick={checkout} className="btn checkout-btn" disabled={loading || cartItems.length === 0}>
                  {loading ? "Processing..." : "Complete Purchase process"}
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
              Previous Orders
            </h2>
            <span className="toggle-icon">
              {showPastOrders ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>

          {showPastOrders && (
            <div className="past-orders">
              {orderHistoryLoading ? (
                <div className="loading-orders">
                  <p>Loading order history...</p>
                </div>
              ) : pastOrders.length === 0 ? (
                <p className="no-orders">No previous orders</p>
              ) : (
                pastOrders.map((order) => (
                  <div key={order._id || order.id} className="past-order">
                    <div className="order-header">
                      <div>
                        <span className="order-id">
                          Order: {order._id || order.id}
                        </span>
                        <span className="order-date">
                          Date: {new Date(order.createdAt || order.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="order-total">
                          Total: ${(order.total || 0).toFixed(2)}
                        </span>
                        <span
                          className={`order-status ${
                            order.status === "DELIVERED" || order.status === "تم التوصيل"
                              ? "delivered"
                              : "processing"
                          }`}
                        >
                          {order.status || "PENDING"}
                        </span>
                      </div>
                    </div>

                    <div className="order-items">
                      {(order.items || []).map((item, index) => (
                        <div key={item.id || item._id || index} className="order-item">
                          <span className="item-name">{item.name || 'Unknown Item'}</span>
                          <span className="item-quantity">
                            amount: {item.quantity || 0}
                          </span>
                          <span className="item-price">
                            ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <div className="no-items">No items found for this order</div>
                      )}
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
