export interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface Character {
  level: number;
  exp: number;
  requiredExp: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    stamina: number;
  };
  currentRegion: string;
  lastActiveDate: string;
  totalWalkDistance?: number;
  totalWalkTime?: number;
  coins?: number;
  equippedCostumes?: {
    head?: string;
    body?: string;
    weapon?: string;
    accessory?: string;
  };
}

export interface WorkoutLog {
  type: 'pushup' | 'squat' | 'plank' | 'walk';
  amount: number;
  statGained: {
    hp: number;
    attack: number;
    defense: number;
    stamina: number;
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface WorkoutResponse {
  message: string;
  workout: WorkoutLog;
  character: Character;
}