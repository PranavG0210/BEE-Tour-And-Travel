import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function Home() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('flights');
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    returnDate: '',
    passengers: '1',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {
      type: searchType,
    };

    if (searchType === 'hotels') {
      // For hotels, use city instead of from/to
      params.city = searchData.from; // Using 'from' field as city
      params.date = searchData.date;
      params.adults = searchData.passengers;
    } else {
      // For flights and buses
      params.from = searchData.from;
      params.to = searchData.to;
      params.date = searchData.date;
      params.adults = searchData.passengers;
      if (searchData.returnDate) {
        params.returnDate = searchData.returnDate;
      }
    }

    const queryString = new URLSearchParams(params).toString();
    navigate(`/search?${queryString}`);
  };

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">Explore the World with TravelHub</h1>
          <p className="hero-subtitle">
            Book flights, hotels, and buses at the best prices. Your journey begins here.
          </p>

          {/* Search Container */}
          <div className="search-container">
            <div className="search-tabs">
              <button
                className={`search-tab ${searchType === 'flights' ? 'active' : ''}`}
                onClick={() => setSearchType('flights')}
              >
                ✈️ Flights
              </button>
              <button
                className={`search-tab ${searchType === 'hotels' ? 'active' : ''}`}
                onClick={() => setSearchType('hotels')}
              >
                🏨 Hotels
              </button>
              <button
                className={`search-tab ${searchType === 'buses' ? 'active' : ''}`}
                onClick={() => setSearchType('buses')}
              >
                🚌 Buses
              </button>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <div className="form-group">
                <label className="form-label">
                  {searchType === 'hotels' ? 'City' : 'From'}
                </label>
                <input
                  type="text"
                  name="from"
                  className="form-input"
                  placeholder={searchType === 'hotels' ? 'City' : 'City or Airport'}
                  value={searchData.from}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {searchType !== 'hotels' && (
                <div className="form-group">
                  <label className="form-label">To</label>
                  <input
                    type="text"
                    name="to"
                    className="form-input"
                    placeholder="City or Airport"
                    value={searchData.to}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Departure Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={searchData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {searchType !== 'hotels' && (
                <div className="form-group">
                  <label className="form-label">Return Date</label>
                  <input
                    type="date"
                    name="returnDate"
                    className="form-input"
                    value={searchData.returnDate}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  {searchType === 'hotels' ? 'Guests' : 'Passengers'}
                </label>
                <select
                  name="passengers"
                  className="form-select"
                  value={searchData.passengers}
                  onChange={handleInputChange}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                🔍 Search {searchType.charAt(0).toUpperCase() + searchType.slice(1)}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose TravelHub?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3 className="feature-title">Best Prices</h3>
            <p className="feature-description">
              We compare thousands of options to bring you the best deals on flights, hotels, and buses.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure Booking</h3>
            <p className="feature-description">
              Your data is protected with industry-leading security measures. Book with confidence.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3 className="feature-title">Global Coverage</h3>
            <p className="feature-description">
              Access millions of options worldwide. From local buses to international flights.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Easy Management</h3>
            <p className="feature-description">
              Manage all your bookings in one place. View, modify, or cancel anytime.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Instant Confirmation</h3>
            <p className="feature-description">
              Get instant booking confirmations via email and SMS. No waiting required.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3 className="feature-title">24/7 Support</h3>
            <p className="feature-description">
              Our customer support team is always ready to help you with any queries.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
