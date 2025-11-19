import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI, bookingAPI } from '../utils/api';

export default function Navigation() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [location.pathname]); // Re-check user on route change

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // When dropdown opens, fetch recent bookings for preview
    let mounted = true;
    const fetchBookings = async () => {
      if (!showUserMenu) return;
      setLoadingBookings(true);
      setBookingsError(null);
      try {
        const res = await bookingAPI.getAll();
        if (!mounted) return;
        if (res.success) {
          // res.data.bookings expected
          setUserBookings(res.data.bookings || []);
        } else {
          setBookingsError(res.message || 'Unable to load bookings');
        }
      } catch (err) {
        if (!mounted) return;
        setBookingsError(err.message || 'Unable to load bookings');
      } finally {
        if (mounted) setLoadingBookings(false);
      }
    };

    fetchBookings();

    return () => { mounted = false; };
  }, [showUserMenu]);

  // Get initials from user name for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    let hash = 0;
    if (name) {
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          ✈️ TravelHub
        </Link>

        <ul className="nav-links">
          <li><Link to="/" className={isActive('/')}>Home</Link></li>

          {!isLoggedIn ? (
            <>
              <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
              <li><Link to="/login" className={isActive('/login')}>Login</Link></li>
              <li><Link to="/signup" className={isActive('/signup')}>Sign Up</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/search" className={isActive('/search')}>Search</Link></li>
              <li><Link to="/bookings" className={isActive('/bookings')}>My Bookings</Link></li>
              {isAdmin && (
                <li><Link to="/admin" className={isActive('/admin')}>Admin Dashboard</Link></li>
              )}
            </>
          )}

          <li>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </li>

          {isLoggedIn && (
            <li className="user-menu-container">
              <button
                className="user-avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={user.name}
              >
                <div
                  className="user-avatar"
                  style={{ backgroundColor: getAvatarColor(user.name) }}
                >
                  {getInitials(user.name)}
                </div>
                <span className="user-name">{user.name}</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-menu-header">
                    <div
                      className="user-avatar-large"
                      style={{ backgroundColor: getAvatarColor(user.name) }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div className="user-menu-name">{user.name}</div>
                      <div className="user-menu-email">{user.email}</div>
                    </div>
                  </div>

                  {/* Recent bookings preview */}
                  <div style={{ padding: '0.5rem 1rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem' }}>Recent Bookings</div>
                    {loadingBookings ? (
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Loading...</div>
                    ) : bookingsError ? (
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-danger)' }}>{bookingsError}</div>
                    ) : userBookings && userBookings.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {userBookings.slice(0, 3).map((b) => (
                          <Link key={b._id} to="/bookings" className="dropdown-item" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.9rem' }}>{b.type && b.type.charAt(0).toUpperCase() + b.type.slice(1)}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>₹{b.price}</div>
                          </Link>
                        ))}
                        <Link to="/bookings" className="dropdown-item" onClick={() => setShowUserMenu(false)} style={{ fontWeight: 600, paddingTop: '0.5rem' }}>View all bookings</Link>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>No bookings yet</div>
                    )}
                  </div>

                  <hr className="dropdown-divider" />

                  <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    👤 Profile
                  </Link>
                  <Link to="/bookings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    📋 My Bookings
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      ⚙️ Admin Dashboard
                    </Link>
                  )}
                  <hr className="dropdown-divider" />
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-btn"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}