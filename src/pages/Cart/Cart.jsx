import { useState, useEffect } from "react";
import {
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaShoppingCart,
  FaHistory,
} from "react-icons/fa";
import "./Cart.css";

const CartPage = () => {
  // حالة سلة التسوق الحالية
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "رواية الظلال الماضية",
      author: "ملرين هاد",
      price: 15.0,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
    },
    {
      id: 2,
      name: "الحب الأبدي",
      author: "روبرت جاي",
      price: 12.99,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=1000",
    },
    {
      id: 3,
      name: "مغامرات في أرض الألعاب",
      author: "روبرت جاي",
      price: 10.99,
      quantity: 3,
      image:
        "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1000",
    },
  ]);

  // حالة الطلبات السابقة
  const [pastOrders, setPastOrders] = useState([
    {
      id: "ORD-2023-001",
      date: "2023-05-15",
      total: 45.99,
      status: "تم التوصيل",
      items: [
        { id: 4, name: "العقل اليقظ", quantity: 1, price: 19.99 },
        { id: 5, name: "التغذية الأساسية", quantity: 2, price: 13.0 },
      ],
    },
    {
      id: "ORD-2023-002",
      date: "2023-04-22",
      total: 32.5,
      status: "تم التوصيل",
      items: [{ id: 6, name: "الفيزياء الكمية", quantity: 1, price: 32.5 }],
    },
    {
      id: "ORD-2023-003",
      date: "2023-03-10",
      total: 67.25,
      status: "تم التوصيل",
      items: [
        { id: 7, name: "ريادة الأعمال", quantity: 1, price: 22.99 },
        { id: 8, name: "الحضارات القديمة", quantity: 1, price: 29.99 },
        { id: 9, name: "الرحلة الروحية", quantity: 1, price: 14.27 },
      ],
    },
  ]);

  // حالة لعرض/إخفاء الطلبات السابقة
  const [showPastOrders, setShowPastOrders] = useState(false);

  // حالة للتحرير
  const [editingItem, setEditingItem] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState(1);

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
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // دالة بدء التحرير
  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditedQuantity(item.quantity);
  };

  // دالة حفظ التعديل
  const saveEdit = () => {
    setCartItems(
      cartItems.map((item) =>
        item.id === editingItem ? { ...item, quantity: editedQuantity } : item
      )
    );
    setEditingItem(null);
  };

  // دالة إلغاء التحرير
  const cancelEdit = () => {
    setEditingItem(null);
  };

  // دالة إتمام عملية الشراء
  const checkout = () => {
    alert("تمت عملية الشراء بنجاح! شكراً لثقتك.");
    // هنا سيتم إضافة الطلب إلى الطلبات السابقة
    const newOrder = {
      id: `ORD-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      date: new Date().toISOString().split("T")[0],
      total: total,
      status: "قيد المعالجة",
      items: cartItems.map(({ id, name, quantity, price }) => ({
        id,
        name,
        quantity,
        price,
      })),
    };

    setPastOrders([newOrder, ...pastOrders]);
    setCartItems([]);
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">
          <FaShoppingCart /> Cart
        </h1>

        {/* سلة التسوق الحالية */}
        <div className="cart-section">
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

                <button onClick={checkout} className="btn checkout-btn">
                  Complete Purchase process
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
              {pastOrders.length === 0 ? (
                <p className="no-orders">No previous orders</p>
              ) : (
                pastOrders.map((order) => (
                  <div key={order.id} className="past-order">
                    <div className="order-header">
                      <div>
                        <span className="order-id">
                          Order number: {order.id}
                        </span>
                        <span className="order-date">Date: {order.date}</span>
                      </div>
                      <div>
                        <span className="order-total">
                          Total: ${order.total.toFixed(2)}
                        </span>
                        <span
                          className={`order-status ${
                            order.status === "تم التوصيل"
                              ? "delivered"
                              : "processing"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item) => (
                        <div key={item.id} className="order-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">
                            amount: {item.quantity}
                          </span>
                          <span className="item-price">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
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
