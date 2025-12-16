# Quick Start Guide

Get the Health RPG game up and running in minutes!

## Prerequisites

- Node.js 18 or higher
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Step 1: Clone the Repository

```bash
git clone https://github.com/fita8547/Exercise_diet_rpg_game.git
cd Exercise_diet_rpg_game
```

## Step 2: Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and update these values:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A random secure string (use a password generator)
# - FRONTEND_URL: http://localhost:5173 (for local development)

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

## Step 3: Set Up Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# The default API URL (http://localhost:5000/api) should work for local development

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Step 4: Start Playing!

1. Open your browser and go to `http://localhost:5173`
2. Click "Register" to create a new account
3. Create your character
4. Start logging activities to gain experience!

## Quick Feature Tour

### 1. Character Tab
- View your character's level, health, stamina, and stats
- Level up when you have enough experience
- Check your combat record and activity metrics

### 2. Activity Tab
- Log your real-world exercises (walking, running, etc.)
- View AI analysis of your physical condition
- See your recent activities
- Optional: Enable GPS to track your location

### 3. Combat Tab
- Start turn-based battles with enemies
- Use stamina to engage in combat
- Choose to attack or defend each turn
- Gain experience from victories

### 4. Map Tab
- View your position on a grid-based map
- Your position updates based on logged activities
- Explore different map regions as you move

## Tips for Best Experience

1. **Regular Activity**: Log activities regularly to keep your character's stamina up
2. **Strategic Combat**: Defend when low on health to reduce damage
3. **Level Up**: Accumulate XP to level up and increase all your stats
4. **GPS Tracking**: Enable GPS when logging outdoor activities for more immersive gameplay

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify your .env file has correct MONGODB_URI
- Ensure port 5000 is not in use

### Frontend won't start
- Ensure backend is running first
- Check if port 5173 is not in use
- Verify .env file has correct API URL

### Can't log in
- Make sure backend is running
- Check browser console for errors
- Clear browser cache and try again

## What's Next?

- Check the main [README.md](README.md) for full documentation
- Explore the API endpoints
- Deploy to production using Vercel (frontend) and Railway (backend)

## Need Help?

- Check the [Issues](https://github.com/fita8547/Exercise_diet_rpg_game/issues) page
- Read the full [README.md](README.md) for detailed information
- Review the code comments in the source files

Happy gaming and stay healthy! 🎮💪
