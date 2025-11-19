# Caching Guide - Travel Booking System

## Overview
Your system uses **Redis** for caching search results to improve performance. When a user searches for flights, hotels, or buses, the results are cached for 1 hour (3600 seconds).

---

## How Caching Works

### **1. Cache Key Format**
```
search:{type}:{from}:{to}:{city}:{date}
```

**Examples:**
```
search:flights:delhi:mumbai::2025-12-01     (Flight search)
search:buses:delhi:mumbai::2025-12-01       (Bus search)
search:hotels:::mumbai:2025-12-01           (Hotel search)
search:all::::                              (All searches)
```

### **2. Cache Flow Diagram**
```
User Search Request
        ↓
[Check Redis Cache]
        ↓
    ┌───┴────┐
    │         │
  CACHE HIT   CACHE MISS
    │         │
    │    [Call API Services]
    │         │
    │    [Generate Mock Data]
    │         │
    │    [Store in Redis]
    │         │
    └───┬────┘
        ↓
[Return Results to Frontend]
```

---

## Identifying Cached Results

### **Method 1: Check Server Console Logs**

When you make a search, look at the backend terminal:

**Cache Hit Example:**
```
🔍 Search request: { type: 'flights', from: 'delhi', to: 'mumbai', city: '', date: '2025-12-01' }
✅ CACHE HIT: search:flights:delhi:mumbai::2025-12-01
```

**Cache Miss Example:**
```
🔍 Search request: { type: 'flights', from: 'delhi', to: 'mumbai', city: '', date: '2025-12-01' }
❌ CACHE MISS: search:flights:delhi:mumbai::2025-12-01
✈️ Searching flights from delhi to mumbai
✈️ Found flights: 10
💾 CACHE SET: search:flights:delhi:mumbai::2025-12-01 (TTL: 3600s)
```

### **Method 2: Check API Response Header**
The API response now includes `_cacheStatus` flag:
```json
{
  "success": true,
  "_cacheStatus": "HIT",  // Indicates this is from cache
  "message": "Search completed successfully",
  "count": { ... }
}
```

### **Method 3: Check Response Time**
- **Cache HIT**: Response < 50ms (very fast)
- **Cache MISS**: Response > 500ms (slower due to API calls)

---

## Cache Behavior Details

### **TTL (Time To Live): 3600 seconds (1 hour)**
After 1 hour, the cache expires and is automatically removed from Redis.

### **What Gets Cached**
- ✅ Search results (flights, buses, hotels)
- ✅ Individual item lookups (flight/hotel/bus by ID)
- ✅ All filtering parameters

### **What Doesn't Get Cached**
- ❌ User authentication data
- ❌ Booking confirmations
- ❌ User profile information

---

## Cache Storage Example

When you search for "delhi to mumbai flights on 2025-12-01", Redis stores:

```javascript
Key: "search:flights:delhi:mumbai::2025-12-01"

Value: {
  "success": true,
  "message": "Search completed successfully",
  "filters": {
    "type": "flights",
    "from": "delhi",
    "to": "mumbai",
    "city": "",
    "date": "2025-12-01"
  },
  "count": {
    "total": 10,
    "hotels": 0,
    "flights": 10,
    "buses": 0
  },
  "data": {
    "flights": [
      {
        "id": "mock_flight_0",
        "airline": "GoAir",
        "from": "delhi",
        "to": "mumbai",
        "price": 4601,
        ...
      },
      // ... 9 more flights
    ]
  }
}
```

---

## Monitoring Cache

### **Using Cache Manager Utility**

Create a test endpoint to check cache status:

```javascript
// Add to backend/routes/adminRoutes.js

const cacheManager = require('../utils/cacheManager');

router.get('/cache/view', async (req, res) => {
  await cacheManager.viewAllCachedSearches();
  res.json({ message: 'Check console for cache details' });
});

router.get('/cache/stats', async (req, res) => {
  await cacheManager.getCacheStats();
  res.json({ message: 'Check console for statistics' });
});

router.delete('/cache/clear', async (req, res) => {
  await cacheManager.clearSearchCache();
  res.json({ success: true, message: 'Cache cleared' });
});
```

### **Manual Redis Inspection**

If you have Redis CLI installed:
```bash
# View all search cache keys
redis-cli KEYS "search:*"

# Check specific cache
redis-cli GET "search:flights:delhi:mumbai::2025-12-01"

# Check TTL (seconds remaining)
redis-cli TTL "search:flights:delhi:mumbai::2025-12-01"

# Clear all search cache
redis-cli DEL "search:*"

# Clear all cache
redis-cli FLUSHALL
```

---

## Cache Performance Impact

### **Scenario 1: First Search**
```
Time: 0 seconds
User searches: delhi → mumbai flights
- Cache MISS
- API calls made
- Data processed
- Results stored in cache
- Total time: ~800ms
```

### **Scenario 2: Repeat Search (within 1 hour)**
```
Time: 5 minutes later
User searches: delhi → mumbai flights (again)
- Cache HIT
- Redis retrieves data instantly
- No API calls
- Total time: ~20ms ✨
```

### **Scenario 3: Cache Expires**
```
Time: 61 minutes later
User searches: delhi → mumbai flights (again)
- Cache MISS (expired after 1 hour)
- API calls made again
- New data cached
- Total time: ~800ms
```

---

## Clearing Cache Scenarios

### **Clear Specific Search**
```javascript
await deleteCache('search:flights:delhi:mumbai::2025-12-01');
```

### **Clear All Flight Searches**
```javascript
await deleteCachePattern('search:flights:*');
```

### **Clear All Searches**
```javascript
await deleteCachePattern('search:*');
```

### **Clear Everything**
```javascript
await clearAllCache();
```

---

## Console Log Indicators

| Log | Meaning |
|-----|---------|
| 🔍 Search request | New search received |
| ✅ CACHE HIT | Data found in cache |
| ❌ CACHE MISS | Cache not found, fetching fresh data |
| ✈️ Searching flights | Calling flight API |
| 🏨 Searching hotels | Calling hotel API |
| 🚌 Searching buses | Calling bus API |
| 💾 CACHE SET | Results stored in cache |

---

## Best Practices

1. **Monitor Cache Size**: Don't let cache grow too large (> 100MB)
2. **Clear on Updates**: When data changes, clear relevant cache
3. **TTL Strategy**: 
   - Short TTL (5 min): Frequently changing data
   - Long TTL (1 hour): Stable data
4. **Error Handling**: Cache errors are caught and don't break the app

---

## Troubleshooting

### **Redis Not Connected**
```
❌ Redis Connection Error
```
**Solution**: Ensure Redis server is running on port 6379

### **Cache Not Working**
```
🔍 Check if redisClient.isOpen is true
```
**Solution**: Verify Redis connection in `redisClient.js`

### **Cache Too Large**
```
redis-cli DBSIZE  // Check number of keys
```
**Solution**: Clear cache using `clearSearchCache()` or set shorter TTL values
