import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { getAuthHeaders } from '../../utils/adminAuth';
import axios from 'axios';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Role filter options
  const roleOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'USER', label: 'Regular Users' },
    { value: 'ADMIN', label: 'Administrators' }
  ];

  // Role badge colors
  const getRoleColor = (role) => {
    const colors = {
      'USER': '#3498db',
      'ADMIN': '#e74c3c',
      'MODERATOR': '#f39c12'
    };
    return colors[role] || '#95a5a6';
  };

  // Fetch users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const response = await axios.get(API_ENDPOINTS.USERS, { headers });
      console.log('Users API Response:', response.data); // Debug log
      setUsers(response.data.doc || []);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setUpdating(true);
      const headers = getAuthHeaders();

      await axios.patch(
        `${API_ENDPOINTS.USERS}/${userId}`,
        { role: newRole },
        { headers }
      );

      // Update the user in state
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, role: newRole }
          : user
      ));

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
      console.error('Error updating user:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (user?.role === 'ADMIN') {
      setError('Cannot delete admin users');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(true);
      const headers = getAuthHeaders();

      await axios.delete(`${API_ENDPOINTS.USERS}/${userId}`, { headers });
      
      setUsers(users.filter(user => user._id !== userId));
      setSelectedUser(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  const getUserStats = () => {
    const stats = {
      total: users.length,
      users: users.filter(u => u.role === 'USER').length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      activeToday: users.filter(u => {
        const lastLogin = new Date(u.updatedAt);
        const today = new Date();
        return lastLogin.toDateString() === today.toDateString();
      }).length,
      newThisWeek: users.filter(u => {
        const created = new Date(u.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return created > weekAgo;
      }).length
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  const stats = getUserStats();

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <h1>Users Management</h1>
        <div className="users-stats">
          <div className="stat-card main">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card users">
            <h3>{stats.users}</h3>
            <p>Regular Users</p>
          </div>
          <div className="stat-card admins">
            <h3>{stats.admins}</h3>
            <p>Administrators</p>
          </div>
          <div className="stat-card active">
            <h3>{stats.activeToday}</h3>
            <p>Active Today</p>
          </div>
          <div className="stat-card new">
            <h3>{stats.newThisWeek}</h3>
            <p>New This Week</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="users-controls">
        <div className="search-section">
          <label htmlFor="userSearch">Search Users:</label>
          <input
            id="userSearch"
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-section">
          <label htmlFor="roleFilter">Filter by Role:</label>
          <select
            id="roleFilter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={loadUsers}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="users-content">
        <div className="users-list">
          <h2>Users ({filteredUsers.length})</h2>
          
          {filteredUsers.length === 0 ? (
            <div className="no-users">
              <p>No users found matching your criteria.</p>
            </div>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Last Activity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="user-info">
                        <div className="user-avatar">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                          <strong>{user.name || 'Unknown User'}</strong>
                          <small>ID: {user._id.slice(-6).toUpperCase()}</small>
                        </div>
                      </td>
                      <td className="user-email">
                        {user.email || 'No email'}
                      </td>
                      <td className="user-phone">
                        {user.phone || 'No phone'}
                      </td>
                      <td className="user-role">
                        <span 
                          className="role-badge"
                          style={{ backgroundColor: getRoleColor(user.role) }}
                        >
                          {user.role || 'USER'}
                        </span>
                      </td>
                      <td className="user-joined">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="user-activity">
                        {formatDate(user.updatedAt)}
                      </td>
                      <td className="user-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => setSelectedUser(user)}
                          title="View user details"
                        >
                          👁️ View
                        </button>
                        {user.role !== 'ADMIN' && (
                          <select
                            value={user.role || 'USER'}
                            onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                            disabled={updating}
                            className="role-select"
                            title="Update user role"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        )}
                        {user.role !== 'ADMIN' && (
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={updating}
                            title="Delete user permanently"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="user-modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="user-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Details</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedUser(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="user-details-grid">
                  <div className="details-section">
                    <h3>Personal Information</h3>
                    <div className="user-avatar-large">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <p><strong>Name:</strong> {selectedUser.name || 'Unknown User'}</p>
                    <p><strong>Email:</strong> {selectedUser.email || 'No email'}</p>
                    <p><strong>Phone:</strong> {selectedUser.phone || 'No phone'}</p>
                    <p><strong>Role:</strong> 
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                      >
                        {selectedUser.role || 'USER'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="details-section">
                    <h3>Account Information</h3>
                    <p><strong>User ID:</strong> {selectedUser._id}</p>
                    <p><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
                    <p><strong>Last Activity:</strong> {formatDate(selectedUser.updatedAt)}</p>
                    <p><strong>Account Status:</strong> 
                      <span className="status-active">Active</span>
                    </p>
                  </div>
                </div>
                
                <div className="modal-actions">
                  {selectedUser.role !== 'ADMIN' && (
                    <>
                      <button 
                        className="btn btn-warning"
                        onClick={() => {
                          const newRole = selectedUser.role === 'USER' ? 'ADMIN' : 'USER';
                          handleRoleUpdate(selectedUser._id, newRole);
                        }}
                        disabled={updating}
                      >
                        {selectedUser.role === 'USER' ? '⬆️ Make Admin' : '⬇️ Make User'}
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => {
                          handleDeleteUser(selectedUser._id);
                          setSelectedUser(null);
                        }}
                        disabled={updating}
                      >
                        🗑️ Delete User
                      </button>
                    </>
                  )}
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
