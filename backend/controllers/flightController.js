const Flight = require('../models/Flight');
const { getCache, setCache } = require('../config/redisClient');

const getAllFlights = async (req, res) => {
  try {
    const cacheKey = 'flights:all';
    
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    const flights = await Flight.find();
    
    const response = {
      success: true,
      count: flights.length,
      data: { flights },
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

const getFlightById = async (req, res) => {
  try {
    const cacheKey = `flights:${req.params.id}`;
    
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    const flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found',
      });
    }
    
    const response = {
      success: true,
      data: { flight },
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

module.exports = {
  getAllFlights,
  getFlightById,
};
