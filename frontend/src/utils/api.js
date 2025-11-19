/**
 * API Utility
 * This file contains helper functions for making API calls to the backend
 * 
 * For beginners: This centralizes all API calls so we don't repeat code
 */

// Base URL for the backend API
// Change this to your backend URL when deploying
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get the authentication token from localStorage
 */
const getToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options (method, body, etc.)
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add token to headers if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Make the request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Parse JSON response
  const data = await response.json();
  
  // If response is not ok, throw error
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Authentication API calls
export const authAPI = {
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Save user and token to localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify({
        ...response.data.user,
        token: response.data.token,
      }));
    }
    
    return response;
  },
  
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Save user and token to localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify({
        ...response.data.user,
        token: response.data.token,
      }));
    }
    
    return response;
  },
  
  getMe: async () => {
    return await apiRequest('/auth/me');
  },
  
  logout: () => {
    localStorage.removeItem('user');
  },
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    return await apiRequest('/users/profile');
  },
  
  updateProfile: async (profileData) => {
    return await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Booking API calls
export const bookingAPI = {
  create: async (bookingData) => {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },
  
  getAll: async () => {
    return await apiRequest('/bookings');
  },
  
  getById: async (id) => {
    return await apiRequest(`/bookings/${id}`);
  },
  
  update: async (id, bookingData) => {
    return await apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  },
  
  delete: async (id) => {
    return await apiRequest(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};

// Search API calls
export const searchAPI = {
  // Search all items or filter by type
  search: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/search?${queryString}`);
  },
  
  // Get item by type and ID
  getItemById: async (type, id) => {
    return await apiRequest(`/search/${type}/${id}`);
  },
};

// Hotel API calls (Public - view only)
export const hotelAPI = {
  getAll: async () => {
    return await apiRequest('/hotels');
  },
  
  getById: async (id) => {
    return await apiRequest(`/hotels/${id}`);
  },
};

// Flight API calls (Public - view only)
export const flightAPI = {
  getAll: async () => {
    return await apiRequest('/flights');
  },
  
  getById: async (id) => {
    return await apiRequest(`/flights/${id}`);
  },
};

// Bus API calls (Public - view only)
export const busAPI = {
  getAll: async () => {
    return await apiRequest('/buses');
  },
  
  getById: async (id) => {
    return await apiRequest(`/buses/${id}`);
  },
};

// Admin API calls (Admin only)
export const adminAPI = {
  getDashboardStats: async () => {
    return await apiRequest('/admin/dashboard');
  },
  
  getAllUsers: async () => {
    return await apiRequest('/admin/users');
  },
  
  updateUserRole: async (userId, role) => {
    return await apiRequest(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
  
  deleteUser: async (userId) => {
    return await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },
  
  getAllBookings: async () => {
    return await apiRequest('/admin/bookings');
  },
  
  createHotel: async (hotelData) => {
    return await apiRequest('/admin/hotels', {
      method: 'POST',
      body: JSON.stringify(hotelData),
    });
  },
  
  updateHotel: async (id, hotelData) => {
    return await apiRequest(`/admin/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hotelData),
    });
  },
  
  deleteHotel: async (id) => {
    return await apiRequest(`/admin/hotels/${id}`, {
      method: 'DELETE',
    });
  },
  
  createFlight: async (flightData) => {
    return await apiRequest('/admin/flights', {
      method: 'POST',
      body: JSON.stringify(flightData),
    });
  },
  
  updateFlight: async (id, flightData) => {
    return await apiRequest(`/admin/flights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flightData),
    });
  },
  
  deleteFlight: async (id) => {
    return await apiRequest(`/admin/flights/${id}`, {
      method: 'DELETE',
    });
  },
  
  createBus: async (busData) => {
    return await apiRequest('/admin/buses', {
      method: 'POST',
      body: JSON.stringify(busData),
    });
  },
  
  updateBus: async (id, busData) => {
    return await apiRequest(`/admin/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(busData),
    });
  },
  
  deleteBus: async (id) => {
    return await apiRequest(`/admin/buses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Real-time Tracker API calls
export const realtimeAPI = {
  // Search with real-time tracking
  search: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/realtime/search?${queryString}`);
  },

  // Search all types
  searchAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/realtime/search-all?${queryString}`);
  },

  // Get search status
  getStatus: async (searchId) => {
    return await apiRequest(`/realtime/status/${searchId}`);
  },

  // Stop tracking
  stopTracking: async (searchId) => {
    return await apiRequest(`/realtime/track/${searchId}`, {
      method: 'DELETE',
    });
  },
};

