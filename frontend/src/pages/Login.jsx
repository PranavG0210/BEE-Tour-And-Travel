import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authAPI } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const response = await authAPI.login(formData.email, formData.password);
      
      if (response.success) {
        // User is automatically saved to localStorage by authAPI
        navigate('/');
      }
    } catch (error) {
      // Handle errors
      setErrors({ 
        general: error.message || 'Login failed. Please try again.' 
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
          <h1 className="auth-title">Welcome Back</h1>
          
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                {errors.general}
              </div>
            )}
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
