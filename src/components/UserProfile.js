import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserProfile.css';

export default function UserProfile() {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      // The authentication state change will handle app reset
      // No need to call onLogout callback here
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    try {
      setLoading(true);
      setMessage('');
      await updateUserProfile({ displayName: displayName.trim() });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderName = () => {
    if (currentUser?.providerData?.length > 0) {
      const provider = currentUser.providerData[0].providerId;
      switch (provider) {
        case 'google.com':
          return 'Google';
        case 'github.com':
          return 'GitHub';
        case 'password':
          return 'Email';
        default:
          return 'Unknown';
      }
    }
    return 'Email';
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {currentUser?.displayName?.charAt(0)?.toUpperCase() || 
               currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h3>{currentUser?.displayName || 'User'}</h3>
          <p className="email">{currentUser?.email}</p>
          <p className="provider">Signed in with {getProviderName()}</p>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="profile-actions">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="edit-button"
          >
            Edit Profile
          </button>
        ) : (
          <form onSubmit={handleUpdateProfile} className="edit-form">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
            />
            <div className="edit-buttons">
              <button
                type="submit"
                disabled={loading || !displayName.trim()}
                className="save-button"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setDisplayName(currentUser?.displayName || '');
                  setMessage('');
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <button onClick={handleLogout} className="logout-button">
          Sign Out
        </button>
      </div>
    </div>
  );
}
