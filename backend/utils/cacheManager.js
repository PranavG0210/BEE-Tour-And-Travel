/**
 * Cache Manager Utility
 * Helps inspect, manage, and understand caching in the application
 */

const { getCache, setCache, deleteCache, deleteCachePattern } = require('../config/redisClient');

/**
 * View all cached search results
 */
const viewAllCachedSearches = async () => {
    try {
        const { createClient } = require('redis');
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const client = createClient({ url: redisUrl });
        await client.connect();

        const keys = await client.keys('search:*');

        console.log('\n📦 ALL CACHED SEARCHES:');
        console.log('='.repeat(80));

        for (const key of keys) {
            const data = await client.get(key);
            const ttl = await client.ttl(key);
            const parsed = JSON.parse(data);

            console.log(`\n🔑 Key: ${key}`);
            console.log(`⏱️  TTL: ${ttl} seconds`);
            console.log(`📊 Results: Hotels=${parsed.data.hotels.length}, Flights=${parsed.data.flights.length}, Buses=${parsed.data.buses.length}`);
        }

        console.log('\n' + '='.repeat(80));
        console.log(`Total cached searches: ${keys.length}\n`);

        await client.disconnect();
    } catch (error) {
        console.error('Error viewing cache:', error.message);
    }
};

/**
 * Clear all search cache
 */
const clearSearchCache = async () => {
    try {
        const result = await deleteCachePattern('search:*');
        if (result) {
            console.log('✅ All search cache cleared!');
        }
    } catch (error) {
        console.error('Error clearing cache:', error.message);
    }
};

/**
 * Get cache info for a specific search
 */
const getCacheInfo = async (type, from, to, city, date) => {
    try {
        const cacheKey = `search:${type}:${from || ''}:${to || ''}:${city || ''}:${date || ''}`;
        const data = await getCache(cacheKey);

        if (data) {
            console.log(`\n✅ CACHE HIT: ${cacheKey}`);
            console.log(`📊 Results: Hotels=${data.data.hotels.length}, Flights=${data.data.flights.length}, Buses=${data.data.buses.length}`);
            console.log(`💾 Data Size: ${JSON.stringify(data).length} bytes`);
            return data;
        } else {
            console.log(`\n❌ CACHE MISS: ${cacheKey}`);
            return null;
        }
    } catch (error) {
        console.error('Error getting cache info:', error.message);
    }
};

/**
 * Cache Statistics
 */
const getCacheStats = async () => {
    try {
        const { createClient } = require('redis');
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const client = createClient({ url: redisUrl });
        await client.connect();

        const keys = await client.keys('search:*');
        let totalSize = 0;
        let nearExpiry = 0; // Items expiring soon (< 5 minutes)

        for (const key of keys) {
            const data = await client.get(key);
            const ttl = await client.ttl(key);

            totalSize += JSON.stringify(data).length;
            if (ttl < 300) nearExpiry++;
        }

        console.log('\n📊 CACHE STATISTICS:');
        console.log('='.repeat(80));
        console.log(`Total cached items: ${keys.length}`);
        console.log(`Total cache size: ${(totalSize / 1024).toFixed(2)} KB`);
        console.log(`Items expiring soon (< 5 min): ${nearExpiry}`);
        console.log('='.repeat(80) + '\n');

        await client.disconnect();
    } catch (error) {
        console.error('Error getting cache stats:', error.message);
    }
};

module.exports = {
    viewAllCachedSearches,
    clearSearchCache,
    getCacheInfo,
    getCacheStats,
};
