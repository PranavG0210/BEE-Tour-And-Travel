import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authAPI } from '../utils/api';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the backend API
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      if (response.success) {
        // User is automatically saved to localStorage by authAPI
        navigate('/');
      }
    } catch (error) {
      // Handle errors
      setErrors({ 
        general: error.message || 'Signup failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                {errors.general}
              </div>
            )}
            <div className="form-group-full">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
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
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group-full">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group-full">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
