const Bus = require('../models/Bus');
const { getCache, setCache } = require('../config/redisClient');

const getAllBuses = async (req, res) => {
  try {
    const cacheKey = 'buses:all';
    
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    const buses = await Bus.find();
    
    const response = {
      success: true,
      count: buses.length,
      data: { buses },
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

const getBusById = async (req, res) => {
  try {
    const cacheKey = `buses:${req.params.id}`;
    
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }
    
    const response = {
      success: true,
      data: { bus },
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
  getAllBuses,
  getBusById,
};
