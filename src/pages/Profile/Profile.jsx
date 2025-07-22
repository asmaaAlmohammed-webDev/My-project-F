import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

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

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7000/api/v1.0.0/users/me",
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
        "http://localhost:7000/api/v1.0.0/users/updateMe",
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
        "http://localhost:7000/api/v1.0.0/users/updateMyPassword",
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

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      {message && (
        <div
          className={`message ${messageType === "error" ? "error" : "success"}`}
        >
          {message}
        </div>
      )}

      <div className="profile-section">
        <div className="profile-header">
          <h2>Personal Information</h2>
          {!editMode ? (
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
          ) : (
            <button onClick={() => setEditMode(false)}>Cancel</button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={userData.email} disabled />
            </div>
            <div className="form-group">
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
            <p>
              <strong>Name:</strong> {userData.name}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Phone:</strong> {userData.phone}
            </p>
            <p>
              <strong>Role:</strong> {userData.role}
            </p>
          </div>
        )}
      </div>

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
            <div className="form-group">
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
            <div className="form-group">
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
            <div className="form-group">
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
    </div>
  );
};

export default Profile;
