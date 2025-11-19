import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { bookingAPI } from '../utils/api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getAll();
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking({ ...booking });
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await bookingAPI.update(editingBooking._id, { status: editingBooking.status });
      await loadBookings();
      setShowModal(false);
      setEditingBooking(null);
    } catch (err) {
      setError(err.message || 'Failed to update booking');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.delete(id);
        await loadBookings();
      } catch (err) {
        setError(err.message || 'Failed to delete booking');
      }
    }
  };

  const handleStatusChange = (status) => {
    setEditingBooking({
      ...editingBooking,
      status: status,
    });
  };

  const getBookingIcon = (type) => {
    if (type === 'flights') return '✈️';
    if (type === 'hotels') return '🏨';
    if (type === 'buses') return '🚌';
    return '📋';
  };

  const getStatusColor = (status) => {
    if (status === 'confirmed') return 'var(--color-success)';
    if (status === 'pending') return 'var(--color-accent)';
    if (status === 'cancelled') return 'var(--color-danger)';
    return 'var(--color-text-light)';
  };

  return (
    <div>
      <Navigation />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 className="section-title">My Bookings</h1>

        {error && (
          <div className="card" style={{ background: '#fee', border: '1px solid #fcc', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
            <p style={{ color: '#c33', margin: 0 }}>❌ {error}</p>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p>Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No bookings yet</h2>
            <p style={{ color: 'var(--color-text-light)' }}>
              Start exploring and book your next adventure!
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <span style={{ fontSize: '1.5rem' }}>
                        {getBookingIcon(booking.type)}
                      </span>
                    </td>
                    <td>
                      {booking.type === 'flights' && (
                        <div>
                          <strong>{booking.item.airline}</strong>
                          <br />
                          {booking.item.from} → {booking.item.to}
                        </div>
                      )}
                      {booking.type === 'hotels' && (
                        <div>
                          <strong>{booking.item.name}</strong>
                          <br />
                          {booking.item.location}
                        </div>
                      )}
                      {booking.type === 'buses' && (
                        <div>
                          <strong>{booking.item.operator}</strong>
                          <br />
                          {booking.item.from} → {booking.item.to}
                        </div>
                      )}
                    </td>
                    <td>
                      {new Date(booking.travelDate).toLocaleDateString()}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>
                        ₹{booking.price}
                      </strong>
                    </td>
                    <td>
                      <span
                        style={{
                          background: getStatusColor(booking.status),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(booking)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          🗑️ Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && editingBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Booking</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                {getBookingIcon(editingBooking.type)}{' '}
                {editingBooking.type === 'flights' && editingBooking.item.airline}
                {editingBooking.type === 'hotels' && editingBooking.item.name}
                {editingBooking.type === 'buses' && editingBooking.item.operator}
              </p>
            </div>

            <div className="form-group-full">
              <label className="form-label">Status</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  className={`btn ${editingBooking.status === 'confirmed' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => handleStatusChange('pending')}
                  className={`btn ${editingBooking.status === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className={`btn ${editingBooking.status === 'cancelled' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Cancelled
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={handleSaveEdit} className="btn btn-primary" style={{ flex: 1 }}>
                💾 Save Changes
              </button>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
