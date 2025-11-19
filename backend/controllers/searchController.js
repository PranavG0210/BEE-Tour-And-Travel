const Hotel = require('../models/Hotel');
const Flight = require('../models/Flight');
const Bus = require('../models/Bus');
const { searchBuses } = require('../services/busService');
const { searchFlights, searchHotels } = require('../services/amadeusService');
const { getCache, setCache } = require('../config/redisClient');
const { registerSearch } = require('../services/priceRefreshService');

// Configuration from environment
const SEARCH_CACHE_TTL = parseInt(process.env.SEARCH_CACHE_TTL || '60'); // Default 60 seconds

const searchAll = async (req, res) => {
  try {
    const { type = 'all', from, to, city, date } = req.query;

    console.log('🔍 Search request:', { type, from, to, city, date });

    const cacheKey = `search:${type}:${from || ''}:${to || ''}:${city || ''}:${date || ''}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log('✅ CACHE HIT:', cacheKey);
      return res.status(200).json({
        ...cachedData,
        _cacheStatus: 'HIT', // Flag to show data is from cache
      });
    }

    console.log('❌ CACHE MISS:', cacheKey);

    let results = {
      hotels: [],
      flights: [],
      buses: [],
    };

    const hotelQuery = {};
    const flightQuery = {};
    const busQuery = {};

    if (city) {
      hotelQuery.$or = [
        { city: { $regex: city, $options: 'i' } },
        { location: { $regex: city, $options: 'i' } },
      ];
    }

    if (from) {
      flightQuery.from = { $regex: from, $options: 'i' };
    }
    if (to) {
      flightQuery.to = { $regex: to, $options: 'i' };
    }
    if (date) {
      flightQuery.departureDate = { $gte: new Date(date) };
    }

    if (from) {
      busQuery.from = { $regex: from, $options: 'i' };
    }
    if (to) {
      busQuery.to = { $regex: to, $options: 'i' };
    }
    if (date) {
      busQuery.departureDate = { $gte: new Date(date) };
    }

    if (type === 'all' || type === 'hotels') {
      // Use hotelService for live search if city parameter provided
      if (city) {
        console.log('🏨 Searching hotels for city:', city);
        try {
          results.hotels = await searchHotels({
            cityCode: city,
            checkInDate: date,
            checkOutDate: date ? new Date(new Date(date).getTime() + 86400000).toISOString().split('T')[0] : null,
            adults: req.query.adults || 1,
          });
          console.log('🏨 Found hotels:', results.hotels.length);
        } catch (e) {
          console.error('Hotel search error:', e.message);
          results.hotels = [];
        }
      } else {
        // Fallback to database if no search parameters
        results.hotels = await Hotel.find(hotelQuery);
      }
    }

    if (type === 'all' || type === 'flights') {
      // Use flightService for live search if from/to parameters provided
      if (from && to) {
        console.log('✈️ Searching flights from', from, 'to', to);
        try {
          results.flights = await searchFlights({
            origin: from,
            destination: to,
            departureDate: date,
            adults: req.query.adults || 1,
          });
          console.log('✈️ Found flights:', results.flights.length);
        } catch (e) {
          console.error('Flight search error:', e.message);
          results.flights = [];
        }
      } else {
        // Fallback to database if no search parameters
        results.flights = await Flight.find(flightQuery);
      }
    }

    if (type === 'all' || type === 'buses') {
      // Use busService for live search if from/to parameters provided
      if (from && to) {
        console.log('🚌 Searching buses from', from, 'to', to);
        try {
          results.buses = await searchBuses({
            origin: from,
            destination: to,
            departureDate: date,
            adults: req.query.adults || 1,
          });
          console.log('🚌 Found buses:', results.buses.length);
        } catch (e) {
          console.error('Bus search error:', e.message);
          results.buses = [];
        }
      } else {
        // Fallback to database if no search parameters
        results.buses = await Bus.find(busQuery);
      }
    }

    const totalCount = results.hotels.length + results.flights.length + results.buses.length;

    console.log('📊 Search results count:', { hotels: results.hotels.length, flights: results.flights.length, buses: results.buses.length });

    const response = {
      success: true,
      message: 'Search completed successfully',
      filters: { type, from, to, city, date },
      count: {
        total: totalCount,
        hotels: results.hotels.length,
        flights: results.flights.length,
        buses: results.buses.length,
      },
      data: results,
    };

    await setCache(cacheKey, response, SEARCH_CACHE_TTL);

    console.log('💾 CACHE SET:', cacheKey, `(TTL: ${SEARCH_CACHE_TTL}s)`);

    // Register search for price refresh tracking
    if (totalCount > 0) {
      const searchId = `${type}:${cacheKey}`;
      const searchParams = { type, from, to, city, date, adults: req.query.adults || 1 };
      registerSearch(searchId, type, searchParams);
      console.log('📍 Search registered for price updates:', searchId);
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const { type, id } = req.params;

    const cacheKey = `search:${type}:${id}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    let item = null;
    let modelName = '';

    switch (type.toLowerCase()) {
      case 'hotels':
      case 'hotel':
        item = await Hotel.findById(id);
        modelName = 'Hotel';
        break;
      case 'flights':
      case 'flight':
        item = await Flight.findById(id);
        modelName = 'Flight';
        break;
      case 'buses':
      case 'bus':
        item = await Bus.findById(id);
        modelName = 'Bus';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Use hotels, flights, or buses',
        });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${modelName} not found`,
      });
    }

    const response = {
      success: true,
      data: {
        type: type.toLowerCase(),
        [type.toLowerCase().slice(0, -1)]: item,
      },
    };

    await setCache(cacheKey, response, 3600);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = { searchAll, getItemById };
