import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { adminAPI, flightAPI, hotelAPI, busAPI } from '../utils/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [buses, setBuses] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'dashboard') {
        const statsRes = await adminAPI.getDashboardStats();
        if (statsRes.success) {
          setDashboardStats(statsRes.data);
        }
      } else if (activeTab === 'users') {
        const usersRes = await adminAPI.getAllUsers();
        if (usersRes.success) {
          setUsers(usersRes.data.users || []);
        }
      } else if (activeTab === 'bookings') {
        const bookingsRes = await adminAPI.getAllBookings();
        if (bookingsRes.success) {
          setAllBookings(bookingsRes.data.bookings || []);
        }
      } else {
        const [flightsRes, hotelsRes, busesRes] = await Promise.all([
          flightAPI.getAll(),
          hotelAPI.getAll(),
          busAPI.getAll(),
        ]);

        if (flightsRes.success) setFlights(flightsRes.data.flights || []);
        if (hotelsRes.success) setHotels(hotelsRes.data.hotels || []);
        if (busesRes.success) setBuses(busesRes.data.buses || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    if (activeTab === 'flights') {
      setCurrentItem({
        airline: '',
        flightNumber: '',
        from: '',
        to: '',
        departureTime: '',
        arrivalTime: '',
        departureDate: '',
        arrivalDate: '',
        price: '',
        seatsAvailable: '',
        totalSeats: 180,
        aircraftType: '',
        duration: '',
        stops: 0,
      });
    } else if (activeTab === 'hotels') {
      setCurrentItem({
        name: '',
        location: '',
        city: '',
        country: '',
        description: '',
        price: '',
        rating: 0,
        amenities: [],
        images: [],
        roomsAvailable: 0,
        checkInTime: '14:00',
        checkOutTime: '11:00',
      });
    } else if (activeTab === 'buses') {
      setCurrentItem({
        operator: '',
        busNumber: '',
        from: '',
        to: '',
        departureTime: '',
        arrivalTime: '',
        departureDate: '',
        arrivalDate: '',
        price: '',
        seatsAvailable: 0,
        totalSeats: 50,
        busType: 'Standard',
        amenities: [],
        duration: '',
      });
    }
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setCurrentItem({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'flights') {
        await adminAPI.deleteFlight(id);
        setFlights(flights.filter(f => f._id !== id));
      } else if (activeTab === 'hotels') {
        await adminAPI.deleteHotel(id);
        setHotels(hotels.filter(h => h._id !== id));
      } else if (activeTab === 'buses') {
        await adminAPI.deleteBus(id);
        setBuses(buses.filter(b => b._id !== id));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const itemData = { ...currentItem };

      if (itemData.price) itemData.price = parseFloat(itemData.price);
      if (itemData.seatsAvailable) itemData.seatsAvailable = parseInt(itemData.seatsAvailable);
      if (itemData.totalSeats) itemData.totalSeats = parseInt(itemData.totalSeats);
      if (itemData.rating) itemData.rating = parseFloat(itemData.rating);
      if (itemData.roomsAvailable) itemData.roomsAvailable = parseInt(itemData.roomsAvailable);
      if (itemData.stops) itemData.stops = parseInt(itemData.stops);

      if (itemData.amenities && typeof itemData.amenities === 'string') {
        itemData.amenities = itemData.amenities.split(',').map(a => a.trim()).filter(a => a);
      }

      if (modalMode === 'add') {
        if (activeTab === 'flights') {
          const response = await adminAPI.createFlight(itemData);
          if (response.success) {
            setFlights([...flights, response.data.flight]);
          }
        } else if (activeTab === 'hotels') {
          const response = await adminAPI.createHotel(itemData);
          if (response.success) {
            setHotels([...hotels, response.data.hotel]);
          }
        } else if (activeTab === 'buses') {
          const response = await adminAPI.createBus(itemData);
          if (response.success) {
            setBuses([...buses, response.data.bus]);
          }
        }
      } else {
        if (activeTab === 'flights') {
          const response = await adminAPI.updateFlight(currentItem._id, itemData);
          if (response.success) {
            setFlights(flights.map(f => f._id === currentItem._id ? response.data.flight : f));
          }
        } else if (activeTab === 'hotels') {
          const response = await adminAPI.updateHotel(currentItem._id, itemData);
          if (response.success) {
            setHotels(hotels.map(h => h._id === currentItem._id ? response.data.hotel : h));
          }
        } else if (activeTab === 'buses') {
          const response = await adminAPI.updateBus(currentItem._id, itemData);
          if (response.success) {
            setBuses(buses.map(b => b._id === currentItem._id ? response.data.bus : b));
          }
        }
      }

      setShowModal(false);
      setCurrentItem(null);
    } catch (err) {
      setError(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCurrentItem({
      ...currentItem,
      [e.target.name]: e.target.value,
    });
  };

  const renderFlightsTable = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Airline</th>
            <th>Flight Number</th>
            <th>From</th>
            <th>To</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Price (₹)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr key={flight._id}>
              <td><strong>{flight.airline}</strong></td>
              <td>{flight.flightNumber}</td>
              <td>{flight.from}</td>
              <td>{flight.to}</td>
              <td>{flight.departureTime} {flight.departureDate ? new Date(flight.departureDate).toLocaleDateString() : ''}</td>
              <td>{flight.arrivalTime} {flight.arrivalDate ? new Date(flight.arrivalDate).toLocaleDateString() : ''}</td>
              <td><strong style={{ color: 'var(--color-primary)' }}>₹{flight.price}</strong></td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(flight)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(flight._id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderHotelsTable = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Hotel Name</th>
            <th>Location</th>
            <th>City</th>
            <th>Rating</th>
            <th>Price (₹)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <tr key={hotel._id}>
              <td><strong>{hotel.name}</strong></td>
              <td>{hotel.location}</td>
              <td>{hotel.city}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {Array(Math.floor(hotel.rating || 0)).fill('⭐').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </td>
              <td><strong style={{ color: 'var(--color-primary)' }}>₹{hotel.price}</strong></td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(hotel)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(hotel._id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBusesTable = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Operator</th>
            <th>Bus Number</th>
            <th>From</th>
            <th>To</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Type</th>
            <th>Price (₹)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <tr key={bus._id}>
              <td><strong>{bus.operator}</strong></td>
              <td>{bus.busNumber}</td>
              <td>{bus.from}</td>
              <td>{bus.to}</td>
              <td>{bus.departureTime} {bus.departureDate ? new Date(bus.departureDate).toLocaleDateString() : ''}</td>
              <td>{bus.arrivalTime} {bus.arrivalDate ? new Date(bus.arrivalDate).toLocaleDateString() : ''}</td>
              <td>{bus.busType}</td>
              <td><strong style={{ color: 'var(--color-primary)' }}>₹{bus.price}</strong></td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(bus)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(bus._id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDashboard = () => {
    if (!dashboardStats) {
      return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading dashboard...</div>;
    }

    const { stats, recentBookings } = dashboardStats.data || {};

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Total Users</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats?.users?.total || 0}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', margin: '0.5rem 0 0 0' }}>Admins: {stats?.users?.admins || 0}</p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Total Bookings</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats?.bookings?.total || 0}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', margin: '0.5rem 0 0 0' }}>
              Pending: {stats?.bookings?.pending || 0} | Confirmed: {stats?.bookings?.confirmed || 0}
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✈️</div>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Total Flights</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats?.items?.flights || 0}</h3>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏨</div>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Total Hotels</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats?.items?.hotels || 0}</h3>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚌</div>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Total Buses</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats?.items?.buses || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>Recent Bookings</h2>
          {recentBookings && recentBookings.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td><strong>{booking.user?.name || 'Unknown'}</strong></td>
                      <td>{booking.type}</td>
                      <td>{booking.item}</td>
                      <td>₹{booking.price}</td>
                      <td>
                        <span
                          style={{
                            background: booking.status === 'confirmed' ? 'var(--color-success)' : booking.status === 'pending' ? 'var(--color-accent)' : 'var(--color-danger)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                          }}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No recent bookings</p>
          )}
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td><strong>{user.name}</strong></td>
              <td>{user.email}</td>
              <td>
                <span style={{ background: user.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-light)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                  {user.role}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                    className="form-select"
                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => handleDeleteUser(user._id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBookings = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Type</th>
            <th>Item</th>
            <th>Price</th>
            <th>Status</th>
            <th>Booking Date</th>
          </tr>
        </thead>
        <tbody>
          {allBookings.map((booking) => (
            <tr key={booking._id}>
              <td><strong>{booking.user?.name || 'Unknown'}</strong></td>
              <td>{booking.type}</td>
              <td>{booking.item}</td>
              <td>₹{booking.price}</td>
              <td>
                <span
                  style={{
                    background: booking.status === 'confirmed' ? 'var(--color-success)' : booking.status === 'pending' ? 'var(--color-accent)' : 'var(--color-danger)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                  }}
                >
                  {booking.status}
                </span>
              </td>
              <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      await adminAPI.updateUserRole(userId, newRole);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      await adminAPI.deleteUser(userId);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const renderModal = () => {
    if (!currentItem) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              {modalMode === 'add' ? 'Add' : 'Edit'} {activeTab === 'flights' ? 'Flight' : activeTab === 'hotels' ? 'Hotel' : 'Bus'}
            </h2>
            <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {activeTab === 'flights' && (
              <>
                <div className="form-group-full">
                  <label className="form-label">Airline</label>
                  <input type="text" name="airline" className="form-input" value={currentItem.airline || ''} onChange={handleInputChange} required />
                </div>
                <div className="form-group-full">
                  <label className="form-label">Flight Number</label>
                  <input type="text" name="flightNumber" className="form-input" value={currentItem.flightNumber || ''} onChange={handleInputChange} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">From</label>
                    <input type="text" name="from" className="form-input" value={currentItem.from || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">To</label>
                    <input type="text" name="to" className="form-input" value={currentItem.to || ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Departure Time</label>
                    <input type="text" name="departureTime" className="form-input" placeholder="08:00" value={currentItem.departureTime || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Arrival Time</label>
                    <input type="text" name="arrivalTime" className="form-input" placeholder="10:30" value={currentItem.arrivalTime || ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Departure Date</label>
                    <input type="date" name="departureDate" className="form-input" value={currentItem.departureDate ? new Date(currentItem.departureDate).toISOString().split('T')[0] : ''} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Arrival Date</label>
                    <input type="date" name="arrivalDate" className="form-input" value={currentItem.arrivalDate ? new Date(currentItem.arrivalDate).toISOString().split('T')[0] : ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Duration</label>
                    <input type="text" name="duration" className="form-input" placeholder="2h 30m" value={currentItem.duration || ''} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Price (₹)</label>
                    <input type="number" name="price" className="form-input" value={currentItem.price || ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Seats Available</label>
                    <input type="number" name="seatsAvailable" className="form-input" value={currentItem.seatsAvailable || ''} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Total Seats</label>
                    <input type="number" name="totalSeats" className="form-input" value={currentItem.totalSeats || 180} onChange={handleInputChange} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'hotels' && (
              <>
                <div className="form-group-full">
                  <label className="form-label">Hotel Name</label>
                  <input type="text" name="name" className="form-input" value={currentItem.name || ''} onChange={handleInputChange} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Location</label>
                    <input type="text" name="location" className="form-input" value={currentItem.location || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">City</label>
                    <input type="text" name="city" className="form-input" value={currentItem.city || ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group-full">
                  <label className="form-label">Country</label>
                  <input type="text" name="country" className="form-input" value={currentItem.country || ''} onChange={handleInputChange} required />
                </div>
                <div className="form-group-full">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-input" rows="3" value={currentItem.description || ''} onChange={handleInputChange} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Rating</label>
                    <select name="rating" className="form-select" value={currentItem.rating || 0} onChange={handleInputChange} required>
                      <option value="0">0 Stars</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Price per Night (₹)</label>
                    <input type="number" name="price" className="form-input" value={currentItem.price || ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group-full">
                  <label className="form-label">Amenities (comma separated)</label>
                  <input type="text" name="amenities" className="form-input" placeholder="Pool, WiFi, Gym" value={Array.isArray(currentItem.amenities) ? currentItem.amenities.join(', ') : (currentItem.amenities || '')} onChange={handleInputChange} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Rooms Available</label>
                    <input type="number" name="roomsAvailable" className="form-input" value={currentItem.roomsAvailable || 0} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Check-in Time</label>
                    <input type="text" name="checkInTime" className="form-input" value={currentItem.checkInTime || '14:00'} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group-full">
                  <label className="form-label">Check-out Time</label>
                  <input type="text" name="checkOutTime" className="form-input" value={currentItem.checkOutTime || '11:00'} onChange={handleInputChange} />
                </div>
              </>
            )}

            {activeTab === 'buses' && (
              <>
                <div className="form-group-full">
                  <label className="form-label">Operator</label>
                  <input type="text" name="operator" className="form-input" value={currentItem.operator || ''} onChange={handleInputChange} required />
                </div>
                <div className="form-group-full">
                  <label className="form-label">Bus Number</label>
                  <input type="text" name="busNumber" className="form-input" value={currentItem.busNumber || ''} onChange={handleInputChange} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">From</label>
                    <input type="text" name="from" className="form-input" value={currentItem.from || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">To</label>
                    <input type="text" name="to" className="form-input" value={currentItem.to || ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Departure Time</label>
                    <input type="text" name="departureTime" className="form-input" placeholder="08:00" value={currentItem.departureTime || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Arrival Time</label>
                    <input type="text" name="arrivalTime" className="form-input" placeholder="08:00" value={currentItem.arrivalTime || ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Departure Date</label>
                    <input type="date" name="departureDate" className="form-input" value={currentItem.departureDate ? new Date(currentItem.departureDate).toISOString().split('T')[0] : ''} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Arrival Date</label>
                    <input type="date" name="arrivalDate" className="form-input" value={currentItem.arrivalDate ? new Date(currentItem.arrivalDate).toISOString().split('T')[0] : ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Bus Type</label>
                    <select name="busType" className="form-select" value={currentItem.busType || 'Standard'} onChange={handleInputChange} required>
                      <option value="Standard">Standard</option>
                      <option value="Sleeper">Sleeper</option>
                      <option value="Semi-Sleeper">Semi-Sleeper</option>
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                    </select>
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Price (₹)</label>
                    <input type="number" name="price" className="form-input" value={currentItem.price || ''} onChange={handleInputChange} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-full">
                    <label className="form-label">Seats Available</label>
                    <input type="number" name="seatsAvailable" className="form-input" value={currentItem.seatsAvailable || 0} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-full">
                    <label className="form-label">Total Seats</label>
                    <input type="number" name="totalSeats" className="form-input" value={currentItem.totalSeats || 50} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group-full">
                  <label className="form-label">Duration</label>
                  <input type="text" name="duration" className="form-input" placeholder="5h 30m" value={currentItem.duration || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group-full">
                  <label className="form-label">Amenities (comma separated)</label>
                  <input type="text" name="amenities" className="form-input" placeholder="WiFi, Charging, TV" value={Array.isArray(currentItem.amenities) ? currentItem.amenities.join(', ') : (currentItem.amenities || '')} onChange={handleInputChange} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? '💾 Saving...' : '💾 Save'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navigation />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
          {['flights', 'hotels', 'buses'].includes(activeTab) && (
            <button onClick={handleAdd} className="btn btn-primary" disabled={loading}>
              ➕ Add New {activeTab === 'flights' ? 'Flight' : activeTab === 'hotels' ? 'Hotel' : 'Bus'}
            </button>
          )}
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--color-border)', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`search-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('flights')}
            className={`search-tab ${activeTab === 'flights' ? 'active' : ''}`}
          >
            ✈️ Flights ({flights.length})
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`search-tab ${activeTab === 'hotels' ? 'active' : ''}`}
          >
            🏨 Hotels ({hotels.length})
          </button>
          <button
            onClick={() => setActiveTab('buses')}
            className={`search-tab ${activeTab === 'buses' ? 'active' : ''}`}
          >
            🚌 Buses ({buses.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
          >
            👥 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`search-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            📋 All Bookings ({allBookings.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'flights' && renderFlightsTable()}
            {activeTab === 'hotels' && renderHotelsTable()}
            {activeTab === 'buses' && renderBusesTable()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'bookings' && renderBookings()}
          </>
        )}
      </div>

      {showModal && renderModal()}
    </div>
  );
}
