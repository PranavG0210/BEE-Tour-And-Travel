const { refreshAllActiveSearches, getAllActiveSearches } = require('./priceRefreshService');
const { broadcastPriceUpdate } = require('./websocketService');

let refreshInterval = null;
const REFRESH_INTERVAL_MS = parseInt(process.env.PRICE_REFRESH_INTERVAL_MS || '30000'); // Default 30 seconds

/**
 * Start the price refresh scheduler
 */
const startScheduler = () => {
  if (refreshInterval) {
    console.log('⚠️  Scheduler already running');
    return;
  }

  console.log(`🔄 Starting price refresh scheduler (interval: ${REFRESH_INTERVAL_MS}ms)`);

  refreshInterval = setInterval(async () => {
    try {
      const activeSearches = getAllActiveSearches();
      
      if (activeSearches.length === 0) {
        return; // No active searches to refresh
      }

      console.log(`🔄 Refreshing prices for ${activeSearches.length} active search(es)...`);

      // Refresh all active searches
      const refreshResults = await refreshAllActiveSearches();

      // Broadcast updates via WebSocket
      refreshResults.forEach((result) => {
        if (result.searchId) {
          broadcastPriceUpdate(result.searchId, {
            type: result.type,
            params: result.params,
            results: result.results,
            cached: false,
          });
        }
      });

      console.log(`✅ Refreshed ${refreshResults.length} search(es)`);
    } catch (error) {
      console.error('❌ Scheduler error:', error.message);
    }
  }, REFRESH_INTERVAL_MS);
};

/**
 * Stop the price refresh scheduler
 */
const stopScheduler = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('🛑 Price refresh scheduler stopped');
  }
};

/**
 * Get scheduler status
 */
const getSchedulerStatus = () => {
  return {
    running: refreshInterval !== null,
    interval: REFRESH_INTERVAL_MS,
    activeSearches: getAllActiveSearches().length,
  };
};

module.exports = {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
};

