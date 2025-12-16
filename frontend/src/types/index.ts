export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Character {
  _id: string;
  userId: string;
  name: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  stamina: number;
  maxStamina: number;
  physicalCondition: {
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    lastUpdated: string;
  };
  position: {
    x: number;
    y: number;
  };
  totalSteps: number;
  totalDistance: number;
  victories: number;
  defeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  userId: string;
  activityType: 'walking' | 'running' | 'exercise' | 'other';
  steps: number;
  distance: number;
  duration: number;
  calories: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}

export interface Combat {
  _id: string;
  userId: string;
  enemyName: string;
  enemyLevel: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  enemyAttack: number;
  enemyDefense: number;
  playerHealthAtStart: number;
  playerHealthCurrent: number;
  status: 'active' | 'victory' | 'defeat';
  experienceGained: number;
  turn: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConditionAnalysis {
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  metrics: {
    avgStepsPerDay: number;
    totalSteps: number;
    totalDistance: number;
    totalDuration: number;
    activitiesLogged: number;
  };
  recommendation: string;
  disclaimer: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
