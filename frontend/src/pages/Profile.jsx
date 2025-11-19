import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { userAPI } from '../utils/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.success) {
        const userData = response.data.user;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
        });
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await userAPI.updateProfile(formData);
      if (response.success) {
        // Update localStorage
        const updatedUser = {
          ...user,
          ...response.data.user,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  };

  return (
    <div>
      <Navigation />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 className="section-title">My Profile</h1>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'var(--color-bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                border: '3px solid var(--color-border)',
              }}
            >
              👤
            </div>
            
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {formData.name || 'User'}
              </h2>
              <p style={{ color: 'var(--color-text-light)' }}>
                {formData.email || 'user@example.com'}
              </p>
              {user?.role === 'admin' && (
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  Admin
                </span>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-full">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group-full">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
                style={{ background: 'var(--color-bg-secondary)', cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
                Email cannot be changed
              </small>
            </div>

            <div className="form-group-full">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group-full">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                className="form-input"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows="3"
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ flex: 1 }}
                >
                  {isSaving ? '💾 Saving...' : '💾 Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  ❌ Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
