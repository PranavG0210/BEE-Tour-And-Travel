const express = require('express');
const {
  searchWithTracking,
  getSearchStatus,
  stopTracking,
  searchAll,
} = require('../controllers/realtimeTrackerController');

const router = express.Router();

// Search with real-time tracking
router.get('/search', searchWithTracking);

// Search all types
router.get('/search-all', searchAll);

// Get search status
router.get('/status/:searchId', getSearchStatus);

// Stop tracking
router.delete('/track/:searchId', stopTracking);

module.exports = router;

