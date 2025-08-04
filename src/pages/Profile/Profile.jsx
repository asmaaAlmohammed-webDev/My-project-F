import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
// ADDED: Import centralized API configuration
import { API_ENDPOINTS } from "../../config/api";

const Profile = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "../../assets/imgs/default-avatar-profile.jpg",
    role: "USER",
  });

  const [editMode, setEditMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error"); // 'error' or 'success'
  const navigate = useNavigate();

  // ADDED: Review functionality state
  const [reviewData, setReviewData] = useState({
    message: "",
    rate: 5,
  });
  const [isReviewEditing, setIsReviewEditing] = useState(false);

  // ADDED: Contact request functionality state
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isContactEditing, setIsContactEditing] = useState(false);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/home");
    // Refresh the page to reset any cached user state
    window.location.reload();
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          API_ENDPOINTS.GET_ME, // CHANGED: Using centralized API configuration
          {
            headers: {
              Authorization: ` Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserData(response.data.doc);
      } catch (error) {
        setMessage("❌ Failed to fetch profile data");
        setMessageType("error");
      }
    };
    fetchProfile();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        API_ENDPOINTS.UPDATE_ME, // CHANGED: Using centralized API configuration
        {
          name: userData.name,
          phone: userData.phone,
          photo: userData.photo,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUserData(response.data.doc);
      setEditMode(false);
      setMessage("✅ Profile updated successfully!");
      setMessageType("success");
      navigate("/profile");
    } catch (error) {
      setMessage("❌ Failed to update profile");
      setMessageType("error");
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("❌ Passwords do not match");
      setMessageType("error");
      return;
    }
    try {
      await axios.patch(
        API_ENDPOINTS.UPDATE_PASSWORD, // CHANGED: Using centralized API configuration
        {
          passwordCurrent: passwordData.currentPassword,
          password: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("✅ Password updated successfully!");
      setMessageType("success");
      setIsPasswordEditing(false);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "❌ Failed to update password"
      );
      setMessageType("error");
    }
  };

  // ADDED: Handle review submission
  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        API_ENDPOINTS.REVIEWS,
        {
          message: reviewData.message,
          rate: reviewData.rate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("✅ Review submitted successfully!");
      setMessageType("success");
      setIsReviewEditing(false);
      setReviewData({ message: "", rate: 5 });
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ Failed to submit review");
      setMessageType("error");
    }
  };

  // ADDED: Handle contact request submission
  const handleContactSubmission = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        API_ENDPOINTS.CONTACT,
        {
          name: contactData.name,
          email: contactData.email,
          message: contactData.message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("✅ Contact request sent successfully!");
      setMessageType("success");
      setIsContactEditing(false);
      setContactData({ name: "", email: "", message: "" });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "❌ Failed to send contact request"
      );
      setMessageType("error");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="1500"
        >
          My Profile
        </h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {message && (
        <div
          className={`message ${messageType === "error" ? "error" : "success"}`}
        >
          {message}
        </div>
      )}

      <div className="profile-section">
        <div className="profile-header">
          <h2
            data-aos="fade-down"
            data-aos-easing="linear"
            data-aos-duration="1500"
          >
            Personal Information
          </h2>
          {!editMode ? (
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
          ) : (
            <button onClick={() => setEditMode(false)}>Cancel</button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleProfileUpdate}>
            <div
              className="form-group"
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <label>Name</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
              />
            </div>
            <div
              className="form-group"
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <label>Email</label>
              <input type="email" value={userData.email} disabled />
            </div>
            <div
              className="form-group"
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <label>Phone</label>
              <input
                type="text"
                value={userData.phone}
                onChange={(e) =>
                  setUserData({ ...userData, phone: e.target.value })
                }
              />
            </div>
            <button type="submit">Save Changes</button>
          </form>
        ) : (
          <div className="profile-info">
            <p
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <strong>Name:</strong> {userData.name}
            </p>
            <p
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <strong>Email:</strong> {userData.email}
            </p>
            <p
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <strong>Phone:</strong> {userData.phone}
            </p>
            <p
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <strong>Role:</strong> {userData.role}
            </p>
          </div>
        )}
      </div>

      {/* Admin Dashboard Access - Only show for ADMIN users */}
      {userData.role === "ADMIN" && (
        <div className="admin-section">
          <div className="admin-header">
            <h2>🛠️ Admin Panel</h2>
            <p>Manage your application with administrator privileges</p>
          </div>
          <div className="admin-actions">
            <button
              onClick={() => navigate("/admin")}
              className="dashboard-btn primary"
            >
              📊 Go to Dashboard
            </button>
            <div className="admin-quick-links">
              <button
                onClick={() => navigate("/admin/categories")}
                className="quick-link-btn"
              >
                📁 Categories
              </button>
              <button
                onClick={() => navigate("/admin/products")}
                className="quick-link-btn"
              >
                📦 Products
              </button>
              <button
                onClick={() => navigate("/admin/orders")}
                className="quick-link-btn"
              >
                🛒 Orders
              </button>
              <button
                onClick={() => navigate("/admin/users")}
                className="quick-link-btn"
              >
                👥 Users
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="password-section">
        <div className="password-header">
          <h2>Password Management</h2>
          {!isPasswordEditing ? (
            <button onClick={() => setIsPasswordEditing(true)}>
              Change Password
            </button>
          ) : (
            <button onClick={() => setIsPasswordEditing(false)}>Cancel</button>
          )}
        </div>

        {isPasswordEditing && (
          <form onSubmit={handlePasswordUpdate}>
            <div
              className="form-group"
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <div
              className="form-group"
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <div
              className="form-group"
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-duration="1500"
            >
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <button type="submit">Update Password</button>
          </form>
        )}
      </div>

      {/* ADDED: Review Section - Only for regular users */}
      {userData.role !== "ADMIN" && (
        <div className="review-section">
          <div className="review-header">
            <h2>Leave a Review</h2>
            {!isReviewEditing ? (
              <button onClick={() => setIsReviewEditing(true)}>
                Write Review
              </button>
            ) : (
              <button onClick={() => setIsReviewEditing(false)}>Cancel</button>
            )}
          </div>

          {isReviewEditing && (
            <form onSubmit={handleReviewSubmission}>
              <div className="form-group">
                <label>Rating (1-5 stars)</label>
                <select
                  value={reviewData.rate}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      rate: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  <option value={1}>⭐ 1 Star</option>
                  <option value={2}>⭐⭐ 2 Stars</option>
                  <option value={3}>⭐⭐⭐ 3 Stars</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                </select>
              </div>
              <div className="form-group">
                <label>Review Message</label>
                <textarea
                  rows="4"
                  value={reviewData.message}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      message: e.target.value,
                    })
                  }
                  placeholder="Share your experience with our bookstore..."
                  required
                />
              </div>
              <button type="submit">Submit Review</button>
            </form>
          )}
        </div>
      )}

      {/* ADDED: Contact Request Section - Only for regular users */}
      {userData.role !== "ADMIN" && (
        <div className="contact-section">
          <div className="contact-header">
            <h2>Contact Support</h2>
            {!isContactEditing ? (
              <button
                onClick={() => {
                  setIsContactEditing(true);
                  // Pre-fill with user data
                  setContactData({
                    name: userData.name,
                    email: userData.email,
                    message: "",
                  });
                }}
              >
                Send Request
              </button>
            ) : (
              <button onClick={() => setIsContactEditing(false)}>Cancel</button>
            )}
          </div>

          {isContactEditing && (
            <form onSubmit={handleContactSubmission}>
              <div
                className="form-group"
                data-aos="fade-down"
                data-aos-easing="linear"
                data-aos-duration="1500"
              >
                <label>Name</label>
                <input
                  type="text"
                  value={contactData.name}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div
                className="form-group"
                data-aos="fade-down"
                data-aos-easing="linear"
                data-aos-duration="1500"
              >
                <label>Email</label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div
                className="form-group"
                data-aos="fade-down"
                data-aos-easing="linear"
                data-aos-duration="1500"
              >
                <label>Message</label>
                <textarea
                  rows="4"
                  value={contactData.message}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      message: e.target.value,
                    })
                  }
                  placeholder="Describe your issue, question, or feedback..."
                  required
                />
              </div>
              <button type="submit">Send Request</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
