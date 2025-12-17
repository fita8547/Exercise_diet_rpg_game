import axios from 'axios';
import { AuthResponse, Character, WorkoutResponse, LocationData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 인증 API
export const authAPI = {
  register: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/register', { email, password }).then(res => res.data),
  
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password }).then(res => res.data),
};

// 캐릭터 API
export const characterAPI = {
  getCharacter: (): Promise<{ character: Character }> =>
    api.get('/character').then(res => res.data),
};

// 운동 API
export const workoutAPI = {
  submitWorkout: (type: string, amount: number): Promise<WorkoutResponse> =>
    api.post('/workout', { type, amount }).then(res => res.data),
  
  getTodayWorkouts: (): Promise<{ date: string; workouts: any[] }> =>
    api.get('/workout/today').then(res => res.data),
};

// 위치 API
export const locationAPI = {
  updateLocation: (location: LocationData): Promise<any> =>
    api.post('/location', location).then(res => res.data),
  
  updateWalkDistance: (distance: number, duration?: number): Promise<any> =>
    api.post('/location/update', { distance, duration }).then(res => res.data),
  
  getCurrentRegion: (): Promise<{ currentRegion: string }> =>
    api.get('/location/region/current').then(res => res.data),
};

// 지도 API
export const mapAPI = {
  updateLocation: (location: LocationData): Promise<any> =>
    api.post('/map/update-location', location).then(res => res.data),
  
  getCurrentGrid: (): Promise<any> =>
    api.get('/map/current-grid').then(res => res.data),
  
  getNextTarget: (): Promise<any> =>
    api.get('/map/next-target').then(res => res.data),
  
  exploreCell: (cellId: string): Promise<any> =>
    api.post('/map/explore-cell', { cellId }).then(res => res.data),
};

// AI 분석 API
export const aiAPI = {
  analyzeBody: (bodyData: {
    height: number;
    weight: number;
    activityLevel: string;
    goal: string;
  }): Promise<any> =>
    api.post('/ai/analyze', bodyData).then(res => res.data),
  
  getCurrentStyle: (): Promise<any> =>
    api.get('/ai/current-style').then(res => res.data),
  
  dailyUpdate: (recentActivity: any): Promise<any> =>
    api.post('/ai/daily-update', { recentActivity }).then(res => res.data),
};

// 몬스터 조우 API
export const encounterAPI = {
  checkEncounter: (movementDistance: number): Promise<any> =>
    api.post('/encounter/check', { movementDistance }).then(res => res.data),
  
  forceEncounter: (monsterType?: string, monsterLevel?: number): Promise<any> =>
    api.post('/encounter/force-encounter', { monsterType, monsterLevel }).then(res => res.data),
  
  getGauge: (): Promise<any> =>
    api.get('/encounter/gauge').then(res => res.data),
  
  resetGauge: (): Promise<any> =>
    api.post('/encounter/reset-gauge').then(res => res.data),
};

// 전투 API
export const battleAPI = {
  getDungeons: (): Promise<any> =>
    api.get('/battle/dungeons').then(res => res.data),
  
  startBattle: (monster: any): Promise<any> =>
    api.post('/battle/start', { monster }).then(res => res.data),
  
  battleAction: (battleId: string, action: any): Promise<any> =>
    api.post('/battle/action', { battleId, action }).then(res => res.data),
  
  getBattle: (battleId: string): Promise<any> =>
    api.get(`/battle/${battleId}`).then(res => res.data),
  
  endBattle: (battleId: string): Promise<any> =>
    api.post('/battle/end', { battleId }).then(res => res.data),
  
  getBattleHistory: (limit?: number, offset?: number): Promise<any> =>
    api.get('/battle/history', { params: { limit, offset } }).then(res => res.data),
};

// 랭킹 시스템
export const rankingAPI = {
  getRanking: (): Promise<any> =>
    api.get('/ranking').then(res => res.data),
};

// 코스튬 시스템
export const costumeAPI = {
  getCostumes: (): Promise<any> =>
    api.get('/costumes').then(res => res.data),
  
  purchaseCostume: (costumeId: string): Promise<any> =>
    api.post('/costumes/purchase', { costumeId }).then(res => res.data),
  
  equipCostume: (costumeId: string, action: 'equip' | 'unequip'): Promise<any> =>
    api.post('/costumes/equip', { costumeId, action }).then(res => res.data),
};

export default api;