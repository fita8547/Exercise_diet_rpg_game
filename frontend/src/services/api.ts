import axios from 'axios';
import { AuthResponse, Character, Activity, Combat, ConditionAnalysis } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, email, password }),
  
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
};

// Character APIs
export const characterAPI = {
  get: () => api.get<Character>('/character'),
  
  create: (name: string) => api.post<Character>('/character', { name }),
  
  update: (data: Partial<Character>) => api.put<Character>('/character', data),
  
  levelUp: () => api.post<{ message: string; character: Character }>('/character/levelup'),
};

// Activity APIs
export const activityAPI = {
  log: (data: {
    activityType: string;
    steps?: number;
    distance?: number;
    duration: number;
    calories?: number;
    location?: { latitude: number; longitude: number };
  }) => api.post<{ activity: Activity; experienceGained: number }>('/activity', data),
  
  getAll: (limit?: number) => api.get<Activity[]>('/activity', { params: { limit } }),
  
  analyzeCondition: () => api.get<ConditionAnalysis>('/activity/analyze'),
};

// Combat APIs
export const combatAPI = {
  start: () => api.post<Combat>('/combat/start'),
  
  executeTurn: (combatId: string, action: 'attack' | 'defend') =>
    api.post<{ combat: Combat; message: string; gameOver: boolean }>(`/combat/${combatId}/turn`, { action }),
  
  getHistory: (limit?: number) => api.get<Combat[]>('/combat/history', { params: { limit } }),
  
  getCurrent: () => api.get<Combat>('/combat/current'),
};

export default api;
