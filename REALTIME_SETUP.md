# Real-Time Price Tracker Setup Guide

This guide explains how to set up and use the real-time price tracking system for flights, hotels, and buses.

## Features

- ✅ Real-time price updates via WebSockets (Socket.io)
- ✅ Redis caching for faster response times (1-5 minute TTL)
- ✅ Automatic price refresh scheduler (configurable interval)
- ✅ Support for Amadeus Flights & Hotels API (free tier)
- ✅ Bus API integration (Travelline or mock data)
- ✅ RESTful API endpoints for initial search
- ✅ WebSocket broadcasting for live updates

## Prerequisites

1. **Node.js** (v14 or higher)
2. **Redis** server running locally or remote
3. **MongoDB** (for existing booking system)
4. **Amadeus API Keys** (optional - system works with mock data if not provided)

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/travel-booking

# Redis
REDIS_URL=redis://localhost:6379

# Amadeus API (Optional - for real flight/hotel data)
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret

# TransportAPI (Bus data - free tier with signup)
TRANSPORT_API_APP_ID=your_transportapi_app_id
TRANSPORT_API_APP_KEY=your_transportapi_app_key
TRANSPORT_API_BASE_URL=https://transportapi.com/v3/uk

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Price Refresh Interval (in milliseconds)
PRICE_REFRESH_INTERVAL_MS=30000
```

4. Start Redis server:
```bash
# On Windows (if installed)
redis-server

# On Linux/Mac
redis-server
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the frontend:
```bash
npm run dev
```

## API Endpoints

### Real-Time Tracker Endpoints

#### 1. Search with Tracking
```
GET /api/realtime/search?type=flights&from=DEL&to=BOM&date=2024-12-25&adults=1
```

**Query Parameters:**
- `type`: `flights`, `hotels`, or `buses` (required)
- `from`: Origin city/airport code (required for flights/buses)
- `to`: Destination city/airport code (required for flights/buses)
- `city`: City name (required for hotels)
- `date`: Departure/check-in date (YYYY-MM-DD)
- `checkInDate`: Check-in date for hotels
- `checkOutDate`: Check-out date for hotels
- `returnDate`: Return date for flights
- `adults`: Number of passengers (default: 1)

**Response:**
```json
{
  "success": true,
  "message": "Search completed",
  "searchId": "uuid-here",
  "type": "flights",
  "params": {...},
  "data": [...],
  "cached": false,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Search All Types
```
GET /api/realtime/search-all?from=DEL&to=BOM&city=Mumbai&date=2024-12-25&adults=1
```

Searches flights, hotels, and buses simultaneously.

#### 3. Get Search Status
```
GET /api/realtime/status/:searchId
```

Returns the current status of a tracked search.

#### 4. Stop Tracking
```
DELETE /api/realtime/track/:searchId
```

Stops tracking a specific search.

## WebSocket Events

### Client → Server

#### Subscribe to Search
```javascript
socket.emit('subscribe_search', {
  searchId: 'uuid-here',
  type: 'flights'
});
```

#### Unsubscribe from Search
```javascript
socket.emit('unsubscribe_search', {
  searchId: 'uuid-here'
});
```

### Server → Client

#### Price Update
```javascript
socket.on('price_update', (data) => {
  console.log(data);
  // {
  //   searchId: 'uuid-here',
  //   type: 'flights',
  //   params: {...},
  //   results: [...],
  //   cached: false,
  //   timestamp: '2024-01-01T00:00:00.000Z'
  // }
});
```

#### Subscription Confirmation
```javascript
socket.on('subscribed', (data) => {
  console.log('Subscribed:', data);
});
```

## Frontend Usage

### Using the Real-Time Search Page

1. Navigate to `/realtime` in your browser
2. Fill in search parameters:
   - Select type (Flights, Hotels, or Buses)
   - Enter origin/destination or city
   - Select date
   - Enter number of adults
3. Click "Search" or "Search All"
4. Results will appear and update automatically via WebSocket

### Using the WebSocket Hook

```javascript
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const { isConnected, lastUpdate, subscribe, unsubscribe } = useWebSocket(
    searchId,
    (data) => {
      // Handle price update
      console.log('New prices:', data.results);
    }
  );

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      {lastUpdate && <p>Last update: {lastUpdate}</p>}
    </div>
  );
}
```

## Configuration

### Price Refresh Interval

Set the refresh interval in `.env`:
```env
PRICE_REFRESH_INTERVAL_MS=30000  # 30 seconds
```

Or modify `backend/services/schedulerService.js`:
```javascript
const REFRESH_INTERVAL_MS = 30000; // 30 seconds
```

### Cache TTL

Cache expiration is randomized between 2-5 minutes to prevent thundering herd. Modify in `backend/services/priceRefreshService.js`:
```javascript
const ttl = Math.floor(Math.random() * 180) + 120; // 2-5 minutes
```

## API Integration

### Amadeus API Setup

1. Sign up at [Amadeus for Developers](https://developers.amadeus.com/)
2. Create a new app
3. Get your API Key and API Secret
4. Add to `.env`:
```env
AMADEUS_API_KEY=your_key
AMADEUS_API_SECRET=your_secret
```

**Note:** The system will use mock data if API keys are not provided.

### Bus API Setup (TransportAPI)

1. Sign up at [TransportAPI](https://developer.transportapi.com/) and create a free app (they provide a limited free tier).
2. Grab your `app_id` and `app_key` from the dashboard.
3. Add them to `.env`:
```env
TRANSPORT_API_APP_ID=your_app_id
TRANSPORT_API_APP_KEY=your_app_key
TRANSPORT_API_BASE_URL=https://transportapi.com/v3/uk
```

**Note:** If these aren’t set, the backend automatically falls back to high-quality mock bus data.

## Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │ HTTP + WebSocket
       │
┌──────▼──────────────────┐
│   Backend Server         │
│  ┌────────────────────┐ │
│  │  Express + Socket.io│ │
│  └──────────┬──────────┘ │
│             │            │
│  ┌──────────▼──────────┐ │
│  │  Controllers        │ │
│  └──────────┬──────────┘ │
│             │            │
│  ┌──────────▼──────────┐ │
│  │  Services           │ │
│  │  - Amadeus API     │ │
│  │  - Bus API         │ │
│  │  - Price Refresh   │ │
│  └──────────┬──────────┘ │
└─────────────┼────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼───┐         ┌─────▼─────┐
│ Redis │         │ Scheduler │
│ Cache │         │ (Interval)│
└───────┘         └───────────┘
```

## Troubleshooting

### WebSocket Connection Issues

1. Check if backend server is running
2. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
3. Check browser console for connection errors
4. Ensure CORS is properly configured

### Redis Connection Issues

1. Verify Redis server is running:
```bash
redis-cli ping
# Should return: PONG
```

2. Check `REDIS_URL` in `.env`
3. System will work without Redis but without caching

### API Rate Limits

- Amadeus free tier has rate limits
- System falls back to mock data on errors
- Adjust refresh interval if hitting rate limits

### No Price Updates

1. Verify scheduler is running (check backend logs)
2. Ensure search is registered (check search status endpoint)
3. Check WebSocket connection status
4. Verify active searches exist (scheduler only refreshes active searches)

## Production Deployment

1. Set `NODE_ENV=production`
2. Use environment variables for all secrets
3. Configure proper CORS settings
4. Use Redis cluster for high availability
5. Set up monitoring for API rate limits
6. Configure WebSocket load balancing (sticky sessions)
7. Use HTTPS/WSS for secure connections

## License

MIT

