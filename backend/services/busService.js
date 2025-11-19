


/**888888.
 * Generate mock bus data
 */
const generateMockBuses = (origin, destination, departureDate, adults) => {
  const operators = [
    'RedBus', 'Volvo', 'SRS Travels', 'KPN Travels', 'Orange Travels',
    'Parveen Travels', 'Neeta Travels', 'Kallada Travels', 'VRL Travels', 'Sharma Travels'
  ];
  const busTypes = ['Sleeper', 'Semi-Sleeper', 'AC Sleeper', 'Non-AC', 'Volvo Multi-Axle'];
  const times = ['08:00', '10:30', '14:00', '18:30', '22:00', '23:30'];
  const amenities = [
    ['WiFi', 'AC', 'Charging Point'],
    ['AC', 'Reclining Seats', 'Water'],
    ['WiFi', 'AC', 'Blanket', 'Charging Point'],
    ['AC', 'Snacks'],
    ['WiFi', 'AC', 'Entertainment', 'Charging Point', 'Blanket'],
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const basePrice = Math.floor(Math.random() * 2000) + 800;
    const price = basePrice * adults;
    const departureTime = times[Math.floor(Math.random() * times.length)];
    const arrivalHour = (parseInt(departureTime.split(':')[0]) + Math.floor(Math.random() * 8) + 6) % 24;
    const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    const durationHours = arrivalHour > parseInt(departureTime.split(':')[0])
      ? arrivalHour - parseInt(departureTime.split(':')[0])
      : (24 - parseInt(departureTime.split(':')[0])) + arrivalHour;

    return {
      id: `mock_bus_${i}`,
      operator: operators[Math.floor(Math.random() * operators.length)],
      busNumber: `${Math.floor(Math.random() * 9000) + 1000}`,
      busType: busTypes[Math.floor(Math.random() * busTypes.length)],
      from: origin || 'Delhi',
      to: destination || 'Mumbai',
      departureTime,
      arrivalTime,
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      arrivalDate: departureDate || new Date().toISOString().split('T')[0],
      duration: `${durationHours}h ${Math.floor(Math.random() * 60)}m`,
      price: price,
      currency: 'INR',
      seatsAvailable: Math.floor(Math.random() * 20) + 5,
      amenities: amenities[Math.floor(Math.random() * amenities.length)],
    };
  });
};

module.exports = {
  searchBuses,
};

