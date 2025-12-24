# API Integration Guide

## ✅ Integration Complete!

The frontend has been successfully integrated with the backend API. The application now fetches and manages data from the PostgreSQL database via the Bun/ElysiaJS backend server.

## 🔄 What Changed

### 1. **API Service Layer** (`src/services/api.js`)
   - Created a centralized API client using the Fetch API
   - Handles all HTTP requests to the backend
   - Includes proper error handling and response parsing
   - Endpoints for players, matches, and statistics

### 2. **GameContext Updates** (`src/context/GameContext.jsx`)
   - ✅ Replaced localStorage with API calls
   - ✅ Fetches players from backend on load
   - ✅ Fetches recent matches from backend
   - ✅ Gets next payer information from server
   - ✅ `addMatch()` now creates matches via API
   - ✅ `deleteMatch()` now removes matches via API
   - ✅ Added loading and error states

### 3. **Loading/Error Handling** (`src/components/LoadingSpinner.jsx`)
   - Shows spinner while fetching data
   - Displays error messages if API fails
   - Provides retry functionality

### 4. **Environment Configuration** (`.env`)
   - Backend API URL configuration
   - Default: `http://localhost:3000/api`

## 🚀 How to Run

### Prerequisites
Make sure both backend and frontend servers are running:

#### 1. Start the Backend Server
```bash
cd c:/Web-project/Billiard-management-Server
bun run dev
```
The backend should be running on `http://localhost:3000`

#### 2. Start the Frontend Server  
```bash
cd c:/Web-project/Billiard-management-UI
npm run dev
```
The frontend should be running on `http://localhost:5173`

## 📡 API Endpoints Used

### Players
- `GET /api/players` - Get all players
- `POST /api/players` - Create a new player
- `DELETE /api/players/:id` - Delete a player

### Matches
- `GET /api/matches/recent?limit=50` - Get recent matches
- `POST /api/matches` - Create a new match
- `DELETE /api/matches/:id` - Delete a match
- `GET /api/matches/payer/next` - Get next payer

### Statistics
- `GET /api/stats` - Get all player statistics
- `GET /api/stats/expenses?timeframe=month` - Get expenses by timeframe

## 🎯 Usage in Components

The API is abstracted through the `GameContext`, so existing components work without changes:

```jsx
import { useGame } from './context/GameContext';

function MyComponent() {
  const { players, matches, nextPayer, addMatch, deleteMatch, loading, error } = useGame();

  // Add a match (now saves to backend automatically)
  const handleAddMatch = async () => {
    const result = await addMatch({
      winner: 'Minh',
      loser: 'Toàn',
      cost: 100000
    });
    
    if (result.success) {
      console.log('Match created!', result.data);
    } else {
      console.error('Failed:', result.error);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {/* Your component UI */}
    </div>
  );
}
```

## 🔐 CORS Configuration

The backend is configured to accept requests from the frontend. If you change the frontend port, update the CORS settings in the backend's `index.ts`:

```typescript
cors({
    origin: ['http://localhost:5173'], // Your frontend URL
    methods: ['GET', 'POST', 'DELETE'],
})
```

## ⚙️ Environment Variables

Create or update `.env` in the frontend root:

```env
VITE_API_URL=http://localhost:3000/api
```

Change this if your backend runs on a different port or domain.

## 🧪 Testing the Integration

1. **Start both servers** (backend and frontend)
2. **Open the frontend** in your browser (`http://localhost:5173`)
3. **Check the loading spinner** - You should see it briefly while data loads
4. **Add a match** - It should save to the database and appear immediately
5. **Delete a match** - It should remove from the database
6. **Check the backend database** - Verify data is persisted

## 📊 Data Flow

```
User Action (Frontend)
    ↓
GameContext function (addMatch, deleteMatch, etc.)
    ↓
billiardAPI service (src/services/api.js)
    ↓
HTTP Request to Backend (Fetch API)
    ↓
Backend API (ElysiaJS)
    ↓
PostgreSQL Database
    ↓
Response back to Frontend
    ↓
Update React State
    ↓
UI Updates
```

## 🐛 Troubleshooting

### "Failed to load data from server"
- Make sure the backend is running on port 3000
- Check that PostgreSQL is running
- Verify the database schema has been initialized (`schema.sql`)
- Check browser console for CORS errors

### CORS Errors
- Ensure backend CORS settings include your frontend URL
- Restart both servers after configuration changes

### "Network request failed"
- Verify `VITE_API_URL` in `.env` matches your backend URL
- Check if backend server is running: `curl http://localhost:3000`
- Restart the frontend dev server after changing `.env`

## 📝 Notes

- The app now requires an internet connection (or local network) to function
- All data is persisted in PostgreSQL, not browser localStorage
- Players and matches are shared across all devices accessing the same backend
- The payer rotation is managed by the backend for consistency

## 🎉 Next Steps

- Add user authentication if needed
- Implement real-time updates with WebSockets
- Add data caching for offline support
- Implement pagination for match history
- Add more advanced statistics and analytics

---

**Integration completed successfully!** 🚀
