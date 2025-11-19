import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { realtimeAPI, bookingAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function RealTimeSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    type: 'flights',
    from: '',
    to: '',
    city: '',
    date: '',
    adults: 1,
  });
  const [results, setResults] = useState({ flights: [], hotels: [], buses: [] });
  const [searchIds, setSearchIds] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);

  // WebSocket connection for real-time updates
  const { isConnected, lastUpdate: wsLastUpdate } = useWebSocket(
    searchIds[searchParams.type] || null,
    (data) => {
      console.log('Real-time update received:', data);
      setUpdateCount(prev => prev + 1);
      setLastUpdate(new Date().toISOString());
      
      // Update results based on type
      if (data.type === 'flights') {
        setResults(prev => ({ ...prev, flights: data.results || [] }));
      } else if (data.type === 'hotels') {
        setResults(prev => ({ ...prev, hotels: data.results || [] }));
      } else if (data.type === 'buses') {
        setResults(prev => ({ ...prev, buses: data.results || [] }));
      }
    }
  );

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setIsTracking(true);
    setUpdateCount(0);

    try {
      const params = { ...searchParams };
      
      // Use real-time search API
      const response = await realtimeAPI.search(params);

      if (response.success) {
        // Store search ID for tracking
        setSearchIds(prev => ({
          ...prev,
          [params.type]: response.searchId,
        }));

        // Update results
        if (params.type === 'flights') {
          setResults(prev => ({ ...prev, flights: response.data || [] }));
        } else if (params.type === 'hotels') {
          setResults(prev => ({ ...prev, hotels: response.data || [] }));
        } else if (params.type === 'buses') {
          setResults(prev => ({ ...prev, buses: response.data || [] }));
        }

        setLastUpdate(new Date().toISOString());
      }
    } catch (err) {
      setError(err.message || 'Failed to search');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchAll = async () => {
    setIsLoading(true);
    setError(null);
    setIsTracking(true);
    setUpdateCount(0);

    try {
      const params = { ...searchParams };
      const response = await realtimeAPI.searchAll(params);

      if (response.success) {
        setSearchIds(response.searchIds || {});
        setResults({
          flights: response.data.flights || [],
          hotels: response.data.hotels || [],
          buses: response.data.buses || [],
        });
        setLastUpdate(new Date().toISOString());
      }
    } catch (err) {
      setError(err.message || 'Failed to search');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTracking = async () => {
    try {
      // Stop tracking all active searches
      const promises = Object.values(searchIds).map(searchId => 
        realtimeAPI.stopTracking(searchId)
      );
      await Promise.all(promises);
      
      setIsTracking(false);
      setSearchIds({});
    } catch (err) {
      console.error('Error stopping tracking:', err);
    }
  };

  const handleBook = async (item, type) => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        alert('Please login to make a booking');
        navigate('/login');
        return;
      }

      const bookingData = {
        type: type,
        item: item,
        bookingDate: new Date().toISOString(),
        travelDate: item.departureDate || item.checkInDate || new Date().toISOString(),
        price: item.price,
        passengers: searchParams.adults || 1,
      };

      const response = await bookingAPI.create(bookingData);
      
      if (response.success) {
        alert('Booking confirmed! Check "My Bookings" to view your booking.');
        navigate('/bookings');
      }
    } catch (err) {
      alert(err.message || 'Failed to create booking. Please try again.');
      console.error('Booking error:', err);
    }
  };

  const renderFlightCard = (flight) => (
    <div key={flight.id || flight._id} className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            ✈️ {flight.airline} - {flight.flightNumber}
          </h3>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>From</p>
              <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{flight.from}</p>
              <p style={{ color: 'var(--color-text-light)' }}>{flight.departureTime}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                {new Date(flight.departureDate).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-light)' }}>
              → {flight.duration || 'N/A'} →
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>To</p>
              <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{flight.to}</p>
              <p style={{ color: 'var(--color-text-light)' }}>{flight.arrivalTime}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                {new Date(flight.arrivalDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {flight.seatsAvailable !== undefined && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
              Seats Available: {flight.seatsAvailable}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)' }}>
            ₹{flight.price}
          </p>
          <button onClick={() => handleBook(flight, 'flights')} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  const renderHotelCard = (hotel) => (
    <div key={hotel.id || hotel._id} className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            🏨 {hotel.name}
          </h3>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
            📍 {hotel.location}, {hotel.city}, {hotel.country}
          </p>
          {hotel.rating > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
              {Array(Math.floor(hotel.rating)).fill('⭐').map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
          )}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {hotel.amenities.map((amenity, i) => (
                <span
                  key={i}
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                  }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
          {hotel.roomsAvailable !== undefined && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
              Rooms Available: {hotel.roomsAvailable}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)' }}>
            ₹{hotel.price}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>per night</p>
          <button onClick={() => handleBook(hotel, 'hotels')} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  const renderBusCard = (bus) => (
    <div key={bus.id || bus._id} className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            🚌 {bus.operator} - {bus.busNumber}
          </h3>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '0.75rem' }}>
            {bus.busType}
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>From</p>
              <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{bus.from}</p>
              <p style={{ color: 'var(--color-text-light)' }}>{bus.departureTime}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                {new Date(bus.departureDate).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-light)' }}>
              → {bus.duration || 'N/A'} →
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>To</p>
              <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{bus.to}</p>
              <p style={{ color: 'var(--color-text-light)' }}>{bus.arrivalTime}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                {new Date(bus.arrivalDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {bus.amenities && bus.amenities.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {bus.amenities.map((amenity, i) => (
                <span
                  key={i}
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                  }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
          {bus.seatsAvailable !== undefined && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
              Seats Available: {bus.seatsAvailable}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)' }}>
            ₹{bus.price}
          </p>
          <button onClick={() => handleBook(bus, 'buses')} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  const totalResults = results.flights.length + results.hotels.length + results.buses.length;

  return (
    <div>
      <Navigation />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 className="section-title">Real-Time Price Tracker</h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
          Search and track live price updates for flights, hotels, and buses
        </p>

        {/* Connection Status */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem', 
          alignItems: 'center',
          padding: '1rem',
          background: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderRadius: '12px',
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isConnected ? '#22c55e' : '#ef4444',
          }} />
          <span style={{ fontWeight: '600' }}>
            {isConnected ? 'Connected' : 'Disconnected'} to WebSocket
          </span>
          {isTracking && (
            <>
              <span style={{ color: 'var(--color-text-light)' }}>•</span>
              <span>Tracking active</span>
              <span style={{ color: 'var(--color-text-light)' }}>•</span>
              <span>Updates received: {updateCount}</span>
              {lastUpdate && (
                <>
                  <span style={{ color: 'var(--color-text-light)' }}>•</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                    Last update: {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Search Form */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Type</label>
              <select
                value={searchParams.type}
                onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              >
                <option value="flights">Flights</option>
                <option value="hotels">Hotels</option>
                <option value="buses">Buses</option>
              </select>
            </div>

            {searchParams.type !== 'hotels' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>From</label>
                  <input
                    type="text"
                    value={searchParams.from}
                    onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                    placeholder="e.g., DEL, Mumbai"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>To</label>
                  <input
                    type="text"
                    value={searchParams.to}
                    onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                    placeholder="e.g., BOM, Delhi"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </>
            )}

            {searchParams.type === 'hotels' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>City</label>
                <input
                  type="text"
                  value={searchParams.city}
                  onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                  placeholder="e.g., Mumbai, Delhi"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date</label>
              <input
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Adults</label>
              <input
                type="number"
                min="1"
                value={searchParams.adults}
                onChange={(e) => setSearchParams({ ...searchParams, adults: parseInt(e.target.value) || 1 })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleSearch} className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Searching...' : `Search ${searchParams.type}`}
            </button>
            <button onClick={handleSearchAll} className="btn btn-secondary" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search All'}
            </button>
            {isTracking && (
              <button onClick={handleStopTracking} className="btn btn-secondary">
                Stop Tracking
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', marginBottom: '2rem', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {totalResults > 0 && (
          <div>
            {results.flights.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  ✈️ Flights ({results.flights.length})
                </h2>
                {results.flights.map(renderFlightCard)}
              </div>
            )}

            {results.hotels.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  🏨 Hotels ({results.hotels.length})
                </h2>
                {results.hotels.map(renderHotelCard)}
              </div>
            )}

            {results.buses.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  🚌 Buses ({results.buses.length})
                </h2>
                {results.buses.map(renderBusCard)}
              </div>
            )}
          </div>
        )}

        {!isLoading && totalResults === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-light)' }}>
              Enter search parameters and click "Search" to start tracking prices
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

