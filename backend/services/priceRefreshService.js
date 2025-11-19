const { searchFlights } = require('./amadeusService');
const { searchHotels } = require('./amadeusService');
const { searchBuses } = require('./busService');
const { setCache, getCache } = require('../config/redisClient');

// Configuration from environment
const SEARCH_CACHE_TTL = parseInt(process.env.SEARCH_CACHE_TTL || '60'); // Default 60 seconds

// Active search queries being tracked
const activeSearches = new Map();

/**
 * Generate cache key from search parameters
 */
const generateCacheKey = (type, params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `search:${type}:${sortedParams}`;
};

/**
 * Fetch and cache search results
 */
const fetchAndCacheResults = async (type, params) => {
  try {
    let results = [];

    switch (type) {
      case 'flights':
        results = await searchFlights({
          origin: params.from,
          destination: params.to,
          departureDate: params.date,
          adults: params.adults || 1,
          returnDate: params.returnDate,
        });
        break;

      case 'hotels':
        results = await searchHotels({
          cityCode: params.city || params.to,
          checkInDate: params.date || params.checkInDate,
          checkOutDate: params.checkOutDate || params.returnDate,
          adults: params.adults || 1,
        });
        break;

      case 'buses':
        results = await searchBuses({
          origin: params.from,
          destination: params.to,
          departureDate: params.date,
          adults: params.adults || 1,
        });
        break;

      default:
        throw new Error(`Invalid search type: ${type}`);
    }

    // Cache results with configurable TTL
    const cacheKey = generateCacheKey(type, params);
    await setCache(cacheKey, results, SEARCH_CACHE_TTL);

    return {
      type,
      params,
      results,
      timestamp: new Date().toISOString(),
      cacheKey,
    };
  } catch (error) {
    console.error(`Error fetching ${type} results:`, error.message);
    throw error;
  }
};

/**
 * Refresh prices for a specific search
 */
const refreshSearchPrices = async (searchId) => {
  const search = activeSearches.get(searchId);
  if (!search) {
    throw new Error(`Search ${searchId} not found`);
  }

  const { type, params } = search;
  const updatedData = await fetchAndCacheResults(type, params);

  // Update active search
  activeSearches.set(searchId, {
    ...search,
    lastRefresh: updatedData.timestamp,
    results: updatedData.results,
  });

  return {
    ...updatedData,
    searchId, // Include searchId in response
  };
};

/**
 * Register a new search for tracking
 */
const registerSearch = (searchId, type, params) => {
  activeSearches.set(searchId, {
    id: searchId,
    type,
    params: { ...params, searchId }, // Include searchId in params for reference
    createdAt: new Date().toISOString(),
    lastRefresh: new Date().toISOString(),
    results: [],
  });
};

/**
 * Get active search
 */
const getActiveSearch = (searchId) => {
  return activeSearches.get(searchId);
};

/**
 * Remove search from tracking
 */
const unregisterSearch = (searchId) => {
  activeSearches.delete(searchId);
};

/**
 * Get all active searches
 */
const getAllActiveSearches = () => {
  return Array.from(activeSearches.values());
};

/**
 * Refresh all active searches
 */
const refreshAllActiveSearches = async () => {
  const refreshPromises = Array.from(activeSearches.keys()).map(async (searchId) => {
    try {
      return await refreshSearchPrices(searchId);
    } catch (error) {
      console.error(`Error refreshing search ${searchId}:`, error.message);
      return null;
    }
  });

  const results = await Promise.all(refreshPromises);
  return results.filter(r => r !== null);
};

module.exports = {
  fetchAndCacheResults,
  refreshSearchPrices,
  registerSearch,
  getActiveSearch,
  unregisterSearch,
  getAllActiveSearches,
  refreshAllActiveSearches,
  generateCacheKey,
};

