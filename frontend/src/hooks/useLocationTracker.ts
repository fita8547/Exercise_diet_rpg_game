import { useState, useEffect, useCallback, useRef } from 'react';
import { locationAPI, workoutAPI } from '../services/api';

// 거리 계산 유틸리티 (Haversine 공식)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const useLocationTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const lastSubmissionRef = useRef<number>(0);
  const accumulatedDistanceRef = useRef<number>(0);
  
  const dailyLimit = 10000; // 10km
  const minDistanceThreshold = 5; // 5m
  const submissionThreshold = 100; // 100m마다 서버에 전송

  // 권한 상태 확인
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermission(result.state as 'granted' | 'denied' | 'prompt');
        result.addEventListener('change', () => {
          setPermission(result.state as 'granted' | 'denied' | 'prompt');
        });
      });
    }
  }, []);

  // 로컬 스토리지에서 오늘의 거리 복원
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedDistance = localStorage.getItem(`walkDistance_${today}`);
    if (savedDistance) {
      setTotalDistance(parseFloat(savedDistance));
    }
  }, []);

  // 거리 저장
  const saveDistance = useCallback((distance: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`walkDistance_${today}`, distance.toString());
  }, []);

  // 서버에 걷기 운동 제출
  const submitWalkingExercise = useCallback(async (distance: number) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // 오프라인 모드 체크 (데모 계정 제외)
      const userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : '';
      const isOffline = !navigator.onLine || userEmail === 'demo@demo.com';
      
      if (!isOffline) {
        // 걷기 운동 기록과 위치 업데이트를 동시에 수행
        await Promise.all([
          workoutAPI.submitWorkout('walk', Math.floor(distance)),
          locationAPI.updateWalkDistance(Math.floor(distance))
        ]);
      }
      
      console.log(`걷기 운동 기록: ${Math.floor(distance)}m ${isOffline ? '(오프라인)' : '(온라인)'}`);
    } catch (error) {
      console.error('걷기 운동 제출 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setError(null);
    setIsTracking(true);
    localStorage.setItem('isTracking', 'true'); // 추적 상태 저장

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000 // 30초 캐시
    };

    // 초기 위치 획득
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition(position);
        lastPositionRef.current = position;
        
        // 서버에 위치 업데이트
        locationAPI.updateLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }).catch(console.error);
      },
      (err) => {
        setError(`위치를 가져올 수 없습니다: ${err.message}`);
        setIsTracking(false);
      },
      options
    );

    // 위치 추적 시작
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition(position);

        if (lastPositionRef.current && totalDistance < dailyLimit) {
          const distance = calculateDistance(
            lastPositionRef.current.coords.latitude,
            lastPositionRef.current.coords.longitude,
            position.coords.latitude,
            position.coords.longitude
          );

          // 유효한 이동 거리인지 확인 (5m 이상, 500m 미만)
          if (distance >= minDistanceThreshold && distance < 500) {
            const newTotal = Math.min(totalDistance + distance, dailyLimit);
            setTotalDistance(newTotal);
            saveDistance(newTotal);
            
            // 누적 거리 업데이트
            accumulatedDistanceRef.current += distance;
            
            // 100m마다 서버에 제출
            if (accumulatedDistanceRef.current >= submissionThreshold) {
              submitWalkingExercise(accumulatedDistanceRef.current);
              accumulatedDistanceRef.current = 0;
            }
          }
        }

        lastPositionRef.current = position;
        
        // 위치 업데이트를 서버에 전송 (5분마다)
        const now = Date.now();
        if (now - lastSubmissionRef.current > 300000) { // 5분
          const isOffline = !navigator.onLine || localStorage.getItem('demoMode') === 'true';
          if (!isOffline) {
            locationAPI.updateLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }).catch(console.error);
          }
          lastSubmissionRef.current = now;
        }
      },
      (err) => {
        setError(`위치 추적 오류: ${err.message}`);
      },
      options
    );
  }, [totalDistance, saveDistance, submitWalkingExercise]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // 남은 거리가 있으면 서버에 제출
    if (accumulatedDistanceRef.current > 0) {
      submitWalkingExercise(accumulatedDistanceRef.current);
      accumulatedDistanceRef.current = 0;
    }
    
    setIsTracking(false);
    localStorage.setItem('isTracking', 'false'); // 추적 상태 저장
  }, [submitWalkingExercise]);

  const resetDistance = useCallback(() => {
    setTotalDistance(0);
    accumulatedDistanceRef.current = 0;
    lastPositionRef.current = null;
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`walkDistance_${today}`);
  }, []);

  return {
    isTracking,
    permission,
    currentPosition,
    totalDistance,
    error,
    isSubmitting,
    startTracking,
    stopTracking,
    resetDistance
  };
};