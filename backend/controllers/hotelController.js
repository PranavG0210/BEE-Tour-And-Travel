const Hotel = require('../models/Hotel');
const { getCache, setCache, deleteCache } = require('../config/redisClient');

const getAllHotels = async (req, res) => {
  try {
    const cacheKey = 'hotels:all';
    
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    const hotels = await Hotel.find();
    
    const response = {
      success: true,
      count: hotels.length,
      data: { hotels },
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

const getHotelById = async (req, res) => {
  try {
    const cacheKey = `hotels:${req.params.id}`;
    
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }
    
    const response = {
      success: true,
      data: { hotel },
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
  getAllHotels,
  getHotelById,
};
