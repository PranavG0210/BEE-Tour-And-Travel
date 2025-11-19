/**
 * Flight and Hotel Search Service (Mock Data Only)
 * Generates realistic mock data for flights and hotels
 */

/**
 * Generate mock flight data
 */
const generateMockFlights = (origin, destination, departureDate, adults) => {
  const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoAir'];
  const times = ['06:00', '09:30', '12:15', '15:45', '18:20', '21:00'];

  return Array.from({ length: 10 }, (_, i) => {
    const basePrice = Math.floor(Math.random() * 5000) + 3000;
    const price = basePrice * adults;
    const departureTime = times[Math.floor(Math.random() * times.length)];
    const arrivalHour = (parseInt(departureTime.split(':')[0]) + Math.floor(Math.random() * 3) + 2) % 24;
    const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;

    return {
      id: `mock_flight_${i}`,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      flightNumber: `${Math.floor(Math.random() * 9000) + 1000}`,
      from: origin || 'DEL',
      to: destination || 'BOM',
      departureTime,
      arrivalTime,
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      arrivalDate: departureDate || new Date().toISOString().split('T')[0],
      duration: `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 60)}m`,
      price: price,
      currency: 'INR',
      seatsAvailable: Math.floor(Math.random() * 10) + 1,
      cabin: 'ECONOMY',
    };
  });
};

/**
 * Generate mock hotel data
 */
const generateMockHotels = (cityCode, checkInDate, checkOutDate, adults) => {
  const hotelNames = [
    'Grand Hotel', 'Royal Palace', 'City View Inn', 'Luxury Suites', 'Comfort Stay',
    'Paradise Resort', 'Sunset Hotel', 'Ocean View', 'Mountain Lodge', 'Garden Plaza'
  ];
  const amenities = [
    ['WiFi', 'Pool', 'Gym'],
    ['WiFi', 'Restaurant', 'Spa'],
    ['WiFi', 'Parking', 'Breakfast'],
    ['WiFi', 'Pool', 'Restaurant', 'Gym'],
    ['WiFi', 'Spa', 'Room Service'],
  ];

  return Array.from({ length: 10 }, (_, i) => {
    const nights = checkInDate && checkOutDate
      ? Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
      : 1;
    const basePrice = Math.floor(Math.random() * 3000) + 2000;
    const price = basePrice * nights * adults;

    return {
      id: `mock_hotel_${i}`,
      name: hotelNames[Math.floor(Math.random() * hotelNames.length)],
      city: cityCode || 'Mumbai',
      location: `${Math.floor(Math.random() * 100)} Main Street`,
      country: 'IN',
      price: price,
      currency: 'INR',
      rating: Math.floor(Math.random() * 3) + 3,
      amenities: amenities[Math.floor(Math.random() * amenities.length)],
      roomsAvailable: Math.floor(Math.random() * 5) + 1,
      checkInDate: checkInDate || new Date().toISOString().split('T')[0],
      checkOutDate: checkOutDate || new Date().toISOString().split('T')[0],
    };
  });
};

/**
 * Search flights
 */
const searchFlights = async (params) => {
  const { origin, destination, departureDate, adults = 1 } = params;
  console.log('✈️ Generating mock flights from', origin, 'to', destination);
  return generateMockFlights(origin, destination, departureDate, adults);
};

/**
 * Search hotels
 */
const searchHotels = async (params) => {
  const { cityCode, checkInDate, checkOutDate, adults = 1 } = params;
  console.log('🏨 Generating mock hotels for', cityCode);
  return generateMockHotels(cityCode, checkInDate, checkOutDate, adults);
};

module.exports = {
  searchFlights,
  searchHotels,
};

