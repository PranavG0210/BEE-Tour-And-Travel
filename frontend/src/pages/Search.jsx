import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { searchAPI, bookingAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState({ hotels: [], flights: [], buses: [] });
  const [searchType, setSearchType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all'); // For filtering display
  const [searchId, setSearchId] = useState(null); // For WebSocket subscription

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type') || 'all';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const date = searchParams.get('date') || '';
    const city = searchParams.get('city') || '';

    setSearchType(type);
    setSelectedType(type);

    // Generate search ID for WebSocket subscription
    const generatedSearchId = `${type}:search:${type}:${from || ''}:${to || ''}:${city || ''}:${date || ''}`;
    setSearchId(generatedSearchId);

    // Call the search API
    loadSearchResults(type, from, to, date, city);
  }, [location.search]);

  // Handle price updates from WebSocket
  const handlePriceUpdate = (data) => {
    console.log('🔄 Updating results from price refresh:', data);
    if (data.results) {
      setResults((prevResults) => ({
        ...prevResults,
        [data.type === 'all' ? 'flights' : data.type]: data.results[data.type] || data.results,
      }));
    }
  };

  // Subscribe to WebSocket for price updates
  useWebSocket(searchId, handlePriceUpdate); const loadSearchResults = async (type, from, to, date, city) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = { type };
      if (from) params.from = from;
      if (to) params.to = to;
      if (date) params.date = date;
      if (city) params.city = city;

      const response = await searchAPI.search(params);

      if (response.success) {
        setResults({
          hotels: response.data.hotels || [],
          flights: response.data.flights || [],
          buses: response.data.buses || [],
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load search results');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async (item, type) => {
    try {
      // Check if user is logged in
      const user = localStorage.getItem('user');
      if (!user) {
        alert('Please login to make a booking');
        navigate('/login');
        return;
      }

      // Create booking data
      const bookingData = {
        type: type,
        item: item,
        bookingDate: new Date().toISOString(),
        travelDate: item.departureDate || item.checkInTime || new Date().toISOString(),
        price: item.price,
        passengers: 1,
      };

      // Call booking API
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

  // Calculate total results
  const totalResults = results.hotels.length + results.flights.length + results.buses.length;

  // Determine which results to show based on selectedType
  const displayResults = {
    hotels: selectedType === 'all' || selectedType === 'hotels' ? results.hotels : [],
    flights: selectedType === 'all' || selectedType === 'flights' ? results.flights : [],
    buses: selectedType === 'all' || selectedType === 'buses' ? results.buses : [],
  };

  return (
    <div>
      <Navigation />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 className="section-title">
          Search Results
        </h1>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${selectedType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedType('all')}
          >
            All ({totalResults})
          </button>
          <button
            className={`btn ${selectedType === 'flights' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedType('flights')}
          >
            Flights ({results.flights.length})
          </button>
          <button
            className={`btn ${selectedType === 'hotels' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedType('hotels')}
          >
            Hotels ({results.hotels.length})
          </button>
          <button
            className={`btn ${selectedType === 'buses' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedType('buses')}
          >
            Buses ({results.buses.length})
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-light)' }}>
              Searching...
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-danger)' }}>
              {error}
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-light)' }}>
              No results found. Try different search criteria.
            </p>
          </div>
        ) : (
          <div>
            {(selectedType === 'all' || selectedType === 'flights') && displayResults.flights.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  ✈️ Flights ({displayResults.flights.length})
                </h2>
                {displayResults.flights.map(renderFlightCard)}
              </div>
            )}

            {(selectedType === 'all' || selectedType === 'hotels') && displayResults.hotels.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  🏨 Hotels ({displayResults.hotels.length})
                </h2>
                {displayResults.hotels.map(renderHotelCard)}
              </div>
            )}

            {(selectedType === 'all' || selectedType === 'buses') && displayResults.buses.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  🚌 Buses ({displayResults.buses.length})
                </h2>
                {displayResults.buses.map(renderBusCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
