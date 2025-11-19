## Price & Availability Refresh Configuration

### ✅ Changes Made

Updated the system to refresh prices and availability every **30 seconds** with shorter cache expiry.

### Configuration Settings

**File: `.env`**
```env
# Price & Availability Refresh Settings
PRICE_REFRESH_INTERVAL_MS=30000      # Refresh every 30 seconds
SEARCH_CACHE_TTL=60                  # Cache expires after 60 seconds
```

### How It Works Now

**Timeline Example:**
```
Time: 0s
├─ User searches flights
├─ Cache MISS → API call → Results stored
├─ Cache expires in: 60s
│
Time: 30s
├─ Scheduler triggers (every 30s)
├─ Refreshes active search prices
├─ Updates prices in real-time via WebSocket
│
Time: 60s
├─ Cache expires
├─ Next search will refresh from API
│
Time: 90s
├─ Scheduler triggers again
├─ If user still viewing, prices update again
```

### Performance Impact

| Metric | Before | After |
|--------|--------|-------|
| Refresh Interval | 30s (was default) | 30s ✅ |
| Cache TTL | 3600s (1 hour) | 60s ⚡ |
| Real-time Updates | Every 30s | Every 30s ✅ |
| Freshness | 1 hour old | ~1 min old ⚡ |

### Updated Files

1. **`.env`** - Added configuration variables
2. **`services/schedulerService.js`** - Uses `PRICE_REFRESH_INTERVAL_MS` from env
3. **`services/priceRefreshService.js`** - Uses `SEARCH_CACHE_TTL` from env
4. **`controllers/searchController.js`** - Uses `SEARCH_CACHE_TTL` from env

### What Changed in Code

**priceRefreshService.js:**
- Before: 2-5 minute randomized TTL
- After: Uses `SEARCH_CACHE_TTL` from environment (60 seconds by default)

**searchController.js:**
- Before: Hard-coded 3600s (1 hour) cache TTL
- After: Uses `SEARCH_CACHE_TTL` from environment (60 seconds)

**Example Console Output:**
```
🔍 Search request: { type: 'flights', from: 'delhi', to: 'mumbai', ... }
❌ CACHE MISS: search:flights:delhi:mumbai::2025-12-01
✈️ Searching flights from delhi to mumbai
✈️ Found flights: 10
💾 CACHE SET: search:flights:delhi:mumbai::2025-12-01 (TTL: 60s)

[After 30 seconds - Scheduler runs]
🔄 Refreshing prices for 1 active search(es)...
✅ Refreshed 1 search(es)

[WebSocket broadcasts price updates to connected clients]
```

### To Customize Further

Edit `.env` to adjust:

```env
# For faster updates (30 seconds instead of current)
PRICE_REFRESH_INTERVAL_MS=30000

# For longer/shorter cache (in seconds)
SEARCH_CACHE_TTL=60    # Change to any value (e.g., 120 for 2 minutes)
```

### Restart Required

After modifying `.env`, restart the backend server:
```bash
node server.js
```

The scheduler will show the new interval on startup:
```
🔄 Starting price refresh scheduler (interval: 30000ms)
```
