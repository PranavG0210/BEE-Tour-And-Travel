const { fetchAndCacheResults, registerSearch, getActiveSearch, unregisterSearch, generateCacheKey } = require('../services/priceRefreshService');
const { broadcastPriceUpdate } = require('../services/websocketService');
const { getCache } = require('../config/redisClient');
const { v4: uuidv4 } = require('uuid');

/**
 * Search flights, hotels, or buses with real-time tracking
 */
const searchWithTracking = async (req, res) => {
  try {
    const { type, from, to, city, date, checkInDate, checkOutDate, returnDate, adults = 1 } = req.query;

    if (!type || !['flights', 'hotels', 'buses'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be flights, hotels, or buses',
      });
    }

    // Build params object
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (city) params.city = city;
    if (date) params.date = date;
    if (checkInDate) params.checkInDate = checkInDate;
    if (checkOutDate) params.checkOutDate = checkOutDate;
    if (returnDate) params.returnDate = returnDate;
    if (adults) params.adults = parseInt(adults);

    // Check cache first
    const cacheKey = generateCacheKey(type, params);
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      // Generate search ID for tracking
      const searchId = uuidv4();
      registerSearch(searchId, type, params);

      return res.status(200).json({
        success: true,
        message: 'Search completed (cached)',
        searchId,
        type,
        params,
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch fresh data
    const searchData = await fetchAndCacheResults(type, params);

    // Register search for tracking
    const searchId = uuidv4();
    registerSearch(searchId, type, params);

    // Broadcast initial results via WebSocket
    broadcastPriceUpdate(searchId, {
      type,
      params,
      results: searchData.results,
      cached: false,
    });

    res.status(200).json({
      success: true,
      message: 'Search completed',
      searchId,
      type,
      params,
      data: searchData.results,
      cached: false,
      timestamp: searchData.timestamp,
    });
  } catch (error) {
    console.error('Search with tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
};

/**
 * Get search status
 */
const getSearchStatus = async (req, res) => {
  try {
    const { searchId } = req.params;

    const search = getActiveSearch(searchId);

    if (!search) {
      return res.status(404).json({
        success: false,
        message: 'Search not found',
      });
    }

    res.status(200).json({
      success: true,
      search,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get search status',
      error: error.message,
    });
  }
};

/**
 * Stop tracking a search
 */
const stopTracking = async (req, res) => {
  try {
    const { searchId } = req.params;

    unregisterSearch(searchId);

    res.status(200).json({
      success: true,
      message: 'Tracking stopped',
      searchId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop tracking',
      error: error.message,
    });
  }
};

/**
 * Search all types (flights, hotels, buses)
 */
const searchAll = async (req, res) => {
  try {
    const { from, to, city, date, checkInDate, checkOutDate, returnDate, adults = 1 } = req.query;

    const searchPromises = [];
    const searchIds = {};

    // Search flights
    if (from && to && date) {
      const flightParams = { from, to, date, adults, returnDate };
      const flightSearchId = uuidv4();
      searchIds.flights = flightSearchId;
      registerSearch(flightSearchId, 'flights', flightParams);
      searchPromises.push(
        fetchAndCacheResults('flights', flightParams).then(data => ({
          type: 'flights',
          searchId: flightSearchId,
          data: data.results,
        }))
      );
    }

    // Search hotels
    if (city && (date || checkInDate)) {
      const hotelParams = {
        city,
        date: date || checkInDate,
        checkInDate: checkInDate || date,
        checkOutDate: checkOutDate || returnDate,
        adults,
      };
      const hotelSearchId = uuidv4();
      searchIds.hotels = hotelSearchId;
      registerSearch(hotelSearchId, 'hotels', hotelParams);
      searchPromises.push(
        fetchAndCacheResults('hotels', hotelParams).then(data => ({
          type: 'hotels',
          searchId: hotelSearchId,
          data: data.results,
        }))
      );
    }

    // Search buses
    if (from && to && date) {
      const busParams = { from, to, date, adults };
      const busSearchId = uuidv4();
      searchIds.buses = busSearchId;
      registerSearch(busSearchId, 'buses', busParams);
      searchPromises.push(
        fetchAndCacheResults('buses', busParams).then(data => ({
          type: 'buses',
          searchId: busSearchId,
          data: data.results,
        }))
      );
    }

    if (searchPromises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
      });
    }

    const results = await Promise.allSettled(searchPromises);

    const response = {
      flights: [],
      hotels: [],
      buses: [],
    };

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        response[result.value.type] = result.value.data;
        // Broadcast updates
        broadcastPriceUpdate(result.value.searchId, {
          type: result.value.type,
          results: result.value.data,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Search completed',
      searchIds,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search all error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
};

module.exports = {
  searchWithTracking,
  getSearchStatus,
  stopTracking,
  searchAll,
};

