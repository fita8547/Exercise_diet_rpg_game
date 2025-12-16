# Health RPG - Exercise Your Way to Victory 🎮💪

An AI-powered health RPG game where your real-world physical activity directly impacts your character's strength and progression. Walk, run, and exercise to level up your character, battle enemies, and explore a grid-based world!

## 🌟 Features

### Core Gameplay
- **AI Body Condition Analysis**: Ethical AI system that analyzes your activity patterns (no medical advice)
- **Character Leveling System**: Gain experience through real-world activities
- **Turn-Based Combat**: Strategic battles with enemies that scale based on your activity level
- **GPS-Based Movement Tracking**: Your real-world movement updates your position on the game map
- **Grid-Based Abstract Map**: Explore a procedurally generated world as you move in real life

### Game Mechanics
- **Activity Tracking**: Log walking, running, exercise, and other activities
- **Dynamic Difficulty**: Enemy strength adapts to your physical activity level
- **Character Stats**: Health, Stamina, Attack, Defense that improve with leveling
- **Combat System**: Strategic turn-based battles with attack and defend actions
- **Experience System**: Earn XP from activities and victories

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - API communication

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

### Deployment
- **Vercel** - Frontend hosting (ready)
- **Railway** - Backend hosting (ready)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔧 Configuration

### Backend Environment Variables (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/health-rpg
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Deploy Frontend to Vercel

```bash
cd frontend
npm run build
# Connect to Vercel and deploy
vercel --prod
```

Set environment variable in Vercel:
- `VITE_API_URL`: Your backend API URL

### Deploy Backend to Railway

1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your Vercel frontend URL
3. Railway will auto-deploy on push

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: { username, email, password }
Response: { token, user }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Character Endpoints (Requires Auth)

#### Get Character
```
GET /api/character
Headers: { Authorization: "Bearer <token>" }
Response: Character object
```

#### Create Character
```
POST /api/character
Body: { name }
Response: Character object
```

#### Update Character
```
PUT /api/character
Body: { health?, stamina?, position?, physicalCondition? }
Response: Updated character
```

#### Level Up
```
POST /api/character/levelup
Response: { message, character }
```

### Activity Endpoints (Requires Auth)

#### Log Activity
```
POST /api/activity
Body: { activityType, steps?, distance?, duration, calories?, location? }
Response: { activity, experienceGained }
```

#### Get Activities
```
GET /api/activity?limit=10
Response: Array of activities
```

#### Analyze Condition
```
GET /api/activity/analyze
Response: { activityLevel, metrics, recommendation, disclaimer }
```

### Combat Endpoints (Requires Auth)

#### Start Combat
```
POST /api/combat/start
Response: Combat object
```

#### Execute Turn
```
POST /api/combat/:combatId/turn
Body: { action: "attack" | "defend" }
Response: { combat, message, gameOver }
```

#### Get Combat History
```
GET /api/combat/history?limit=10
Response: Array of past combats
```

#### Get Current Combat
```
GET /api/combat/current
Response: Active combat or 404
```

## 🎮 How to Play

1. **Register & Create Character**: Sign up and create your hero
2. **Log Activities**: Record your real-world walking, running, or exercise
3. **Gain Experience**: Each activity grants XP to your character
4. **Level Up**: Accumulate XP to level up and increase stats
5. **Enter Combat**: Use stamina to battle enemies (20 stamina per fight)
6. **Strategic Battles**: Choose to attack or defend in turn-based combat
7. **Explore the Map**: Your real-world movement updates your position
8. **Check AI Analysis**: Review your activity patterns and get recommendations

## ⚠️ Important Notes

- **Not Medical Advice**: This game provides activity analysis for gameplay purposes only. Consult healthcare professionals for actual health guidance.
- **Ethical AI**: The AI system analyzes activity patterns to adjust gameplay, not to provide health recommendations.
- **GPS Permission**: Location tracking is optional and only used to enhance gameplay.

## 🏗️ Project Structure

```
Exercise_diet_rpg_game/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & other middleware
│   │   ├── config/          # Database config
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- [ ] Mobile app version (React Native)
- [ ] Social features (friends, leaderboards)
- [ ] More enemy types and boss battles
- [ ] Equipment and inventory system
- [ ] Quests and achievements
- [ ] Integration with fitness trackers
- [ ] Multiplayer battles
- [ ] More detailed map with biomes

---

**Made with ❤️ for health and gaming enthusiasts**
