// Quick Reference: Caching System

// ════════════════════════════════════════════════════════════════════════════════
// HOW TO IDENTIFY CACHED VS FRESH DATA
// ════════════════════════════════════════════════════════════════════════════════

// 1️⃣  BACKEND CONSOLE LOGS
// ──────────────────────────────────────────────────────────────────────────────

// CACHE HIT (Data from Redis - FAST ⚡)
🔍 Search request: { type: 'flights', from: 'delhi', to: 'mumbai', ... }
✅ CACHE HIT: search: flights: delhi: mumbai:: 2025 - 12-01

// CACHE MISS (Fresh data from API - SLOW 🐢)
🔍 Search request: { type: 'flights', from: 'delhi', to: 'mumbai', ... }
❌ CACHE MISS: search: flights: delhi: mumbai:: 2025 - 12-01
✈️ Searching flights from delhi to mumbai
✈️ Found flights: 10
💾 CACHE SET: search: flights: delhi: mumbai:: 2025 - 12-01(TTL: 3600s)


// ════════════════════════════════════════════════════════════════════════════════
// CACHE KEY BREAKDOWN
// ════════════════════════════════════════════════════════════════════════════════

Format: search: { type }: { from }: { to }: { city }: { date }

Examples:
search: flights: delhi: mumbai:: 2025 - 12-01      → Flight search(from / to used)
search: buses: delhi: mumbai:: 2025 - 12-01        → Bus search(from / to used)
search: hotels::: mumbai: 2025 - 12-01            → Hotel search(city used)
search: flights: delhi: mumbai::                → Flights with no date
search: all::::                               → All results with no filters


// ════════════════════════════════════════════════════════════════════════════════
// CACHE LIFECYCLE
// ════════════════════════════════════════════════════════════════════════════════

1. USER SEARCHES
   ↓
2. BACKEND CHECKS REDIS
   ├─ IF FOUND → Return cached data(20ms) ✅ CACHE HIT
   └─ IF NOT FOUND → Continue to step 3
   ↓
3. BACKEND CALLS SERVICES
    - searchFlights()
    - searchHotels()
    - searchBuses()
   ↓
4. BACKEND STORES IN REDIS
    - TTL: 3600 seconds(1 hour)
        - Key: Based on search parameters
   ↓
5. RETURN TO FRONTEND(800ms) ❌ CACHE MISS


// ════════════════════════════════════════════════════════════════════════════════
// WHAT'S STORED IN CACHE
// ════════════════════════════════════════════════════════════════════════════════

{
    "success": true,
        "message": "Search completed successfully",
            "filters": {
        "type": "flights",
            "from": "delhi",
                "to": "mumbai",
                    "date": "2025-12-01"
    },
    "count": {
        "total": 10,
            "flights": 10,
                "hotels": 0,
                    "buses": 0
    },
    "data": {
        "flights": [
            { id, airline, from, to, price, departureTime, arrivalTime, ... },
            { ... }
        ]
    }
}


// ════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE COMPARISON
// ════════════════════════════════════════════════════════════════════════════════

SCENARIO                          TIME        STATUS
───────────────────────────────────────────────────────────────────────────────
1st search(delhi→mumbai flights)  ~800ms     ❌ CACHE MISS(fresh data)
2nd search(same)                  ~20ms      ✅ CACHE HIT(from Redis)
3rd search(same, after 1 hour)    ~800ms     ❌ CACHE MISS(expired)
Different search(delhi→delhi)     ~800ms     ❌ CACHE MISS(different params)


// ════════════════════════════════════════════════════════════════════════════════
// IDENTIFYING CACHED ITEMS IN CODE
// ════════════════════════════════════════════════════════════════════════════════

// In searchController.js line 18-20:
const cachedData = await getCache(cacheKey);
if (cachedData) {
    // This is CACHED DATA - Return immediately
    return res.status(200).json({
        ...cachedData,
        _cacheStatus: 'HIT'  // ← Flag to show it's cached
    });
}

// In searchController.js line 145-146:
await setCache(cacheKey, response, 3600);  // Store for 3600 seconds (1 hour)
console.log('💾 CACHE SET:', cacheKey, '(TTL: 3600s)');


// ════════════════════════════════════════════════════════════════════════════════
// CACHE MANAGEMENT COMMANDS
// ════════════════════════════════════════════════════════════════════════════════

// View all cached searches (in backend)
const { viewAllCachedSearches } = require('./utils/cacheManager');
await viewAllCachedSearches();

// Clear all search cache
const { clearSearchCache } = require('./utils/cacheManager');
await clearSearchCache();

// Get cache stats
const { getCacheStats } = require('./utils/cacheManager');
await getCacheStats();


// ════════════════════════════════════════════════════════════════════════════════
// REDIS CLI COMMANDS (if Redis installed)
// ════════════════════════════════════════════════════════════════════════════════

redis - cli KEYS "search:*"                          // View all cache keys
redis - cli GET "search:flights:delhi:mumbai::2025-12-01"  // Get specific cache
redis - cli TTL "search:flights:delhi:mumbai::2025-12-01"  // Check TTL
redis - cli DBSIZE                                   // Total keys in Redis
redis - cli FLUSHALL                                 // Clear everything


// ════════════════════════════════════════════════════════════════════════════════
// KEY INDICATORS
// ════════════════════════════════════════════════════════════════════════════════

✅ CACHE HIT indicators:
- Console shows "✅ CACHE HIT"
    - Response time < 50ms
        - No API calls logged
            - "_cacheStatus": "HIT" in response

❌ CACHE MISS indicators:
- Console shows "❌ CACHE MISS"
    - Response time > 500ms
        - API service calls logged(✈️ ✈️ 🏨 🚌)
            - "💾 CACHE SET" log appears
