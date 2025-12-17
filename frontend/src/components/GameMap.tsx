import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Locate, Target, Clock } from 'lucide-react';

interface GameMapProps {
  totalWalkDistance?: number;
  nearbyDungeons?: any[];
}

const GameMap: React.FC<GameMapProps> = ({ totalWalkDistance = 0, nearbyDungeons = [] }) => {
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapUrl, setMapUrl] = useState<string>('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition(position);
        setIsLoadingLocation(false);
        
        // OpenStreetMap 기반 무료 지도 URL 생성 (더 확대된 줌 레벨)
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const zoom = 18; // 줌 레벨을 18로 증가 (건물이 보이는 수준)
        // 더 좁은 범위로 설정하여 더 확대된 지도 표시
        const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.002},${lat-0.002},${lng+0.002},${lat+0.002}&layer=mapnik&marker=${lat},${lng}`;
        setMapUrl(embedUrl);
        setLastUpdateTime(new Date());
        console.log(`🗺️ 지도 업데이트: ${lat.toFixed(6)}, ${lng.toFixed(6)} (줌: ${zoom})`);
      },
      (error) => {
        setLocationError(`위치를 가져올 수 없습니다: ${error.message}`);
        setIsLoadingLocation(false);
        
        // 기본 위치 (서울 시청) - OpenStreetMap (더 확대)
        const defaultUrl = `https://www.openstreetmap.org/export/embed.html?bbox=126.976,37.564,126.980,37.568&layer=mapnik&marker=37.5665,126.9780`;
        setMapUrl(defaultUrl);
        setLastUpdateTime(new Date());
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 다음 해금될 던전 찾기
  const getNextDungeon = () => {
    const lockedDungeons = nearbyDungeons
      .filter(d => !d.canEnter && d.requiredDistance > totalWalkDistance)
      .sort((a, b) => a.requiredDistance - b.requiredDistance);
    
    return lockedDungeons[0] || null;
  };

  const nextDungeon = getNextDungeon();

  // 걸은 거리가 변경될 때마다 다음 던전 정보 업데이트
  useEffect(() => {
    console.log(`🚶 걸은 거리 업데이트: ${totalWalkDistance}m`);
    if (nextDungeon) {
      console.log(`🏰 다음 던전: ${nextDungeon.name} (필요: ${nextDungeon.requiredDistance}m)`);
    }
  }, [totalWalkDistance, nextDungeon]);

  // 컴포넌트 마운트 시 위치 가져오기
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // 20초마다 자동으로 위치 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 자동 위치 업데이트 (20초마다)');
      getCurrentLocation();
    }, 20000); // 20초마다

    return () => clearInterval(interval);
  }, []);

  // 위치 추적이 활성화된 경우 더 자주 업데이트 (10초마다)
  useEffect(() => {
    // 위치 추적 중인지 확인 (localStorage에서 tracking 상태 확인)
    const checkTrackingStatus = () => {
      const isTracking = localStorage.getItem('isTracking') === 'true';
      return isTracking;
    };

    if (checkTrackingStatus()) {
      console.log('🏃 추적 모드 활성화: 10초마다 지도 업데이트');
      const trackingInterval = setInterval(() => {
        console.log('🏃 추적 모드: 위치 업데이트 (10초마다)');
        getCurrentLocation();
      }, 10000); // 10초마다

      return () => clearInterval(trackingInterval);
    }
  }, []);

  // 위치 변화 감지를 위한 실시간 모니터링
  useEffect(() => {
    let watchId: number | null = null;

    const startWatching = () => {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            // 이전 위치와 비교하여 유의미한 변화가 있을 때만 업데이트
            if (currentPosition) {
              const distance = calculateDistance(
                currentPosition.coords.latitude,
                currentPosition.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
              );
              
              // 10m 이상 이동했을 때만 지도 업데이트
              if (distance > 10) {
                console.log(`📍 위치 변화 감지: ${distance.toFixed(1)}m 이동`);
                setCurrentPosition(position);
                
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.002},${lat-0.002},${lng+0.002},${lat+0.002}&layer=mapnik&marker=${lat},${lng}`;
                setMapUrl(embedUrl);
                setLastUpdateTime(new Date());
              }
            } else {
              setCurrentPosition(position);
            }
          },
          (error) => {
            console.error('위치 감시 오류:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000 // 5초 캐시
          }
        );
      }
    };

    startWatching();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [currentPosition]);

  // 거리 계산 함수
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

  return (
    <div className="bg-white rounded-lg p-4 border-4 border-yellow-400">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-bold text-black">현재 위치</h3>
            {lastUpdateTime && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-500">
                  {lastUpdateTime.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded disabled:bg-yellow-300"
          title="위치 새로고침"
        >
          <Locate className={`w-4 h-4 ${isLoadingLocation ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 실제 지도 (OpenStreetMap) */}
      <div className="relative w-full h-80 rounded-lg border-2 border-gray-300 overflow-hidden mb-4">
        {mapUrl ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="현재 위치 지도 (OpenStreetMap)"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            {isLoadingLocation ? (
              <div className="text-center">
                <Locate className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">지도 로딩 중...</p>
              </div>
            ) : (
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">지도를 불러올 수 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* 로딩 오버레이 */}
        {isLoadingLocation && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Locate className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-black font-bold">위치 찾는 중...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 현재 걸은 거리 */}
      <div className="bg-green-50 p-3 rounded border border-green-200 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-green-600" />
          <span className="font-bold text-black text-sm">총 걸은 거리</span>
        </div>
        <div className="text-lg font-bold text-green-600">
          {(totalWalkDistance / 1000).toFixed(2)} km
        </div>
        <div className="text-xs text-gray-600">
          {totalWalkDistance} 미터
        </div>
      </div>

      {/* 다음 던전 해금 정보 */}
      {nextDungeon && (
        <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-black text-sm">다음 던전 해금</span>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-blue-600">{nextDungeon.name}</div>
            <div className="text-sm text-black">
              필요 거리: {(nextDungeon.requiredDistance / 1000).toFixed(1)} km
            </div>
            <div className="text-sm text-black">
              남은 거리: {((nextDungeon.requiredDistance - totalWalkDistance) / 1000).toFixed(1)} km
            </div>
            
            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (totalWalkDistance / nextDungeon.requiredDistance) * 100)}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-600">
              진행률: {Math.min(100, Math.round((totalWalkDistance / nextDungeon.requiredDistance) * 100))}%
            </div>
          </div>
        </div>
      )}

      {/* 위치 정보 */}
      {currentPosition && (
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="font-bold text-black text-sm">GPS 좌표</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>위도: {currentPosition.coords.latitude.toFixed(6)}°</div>
            <div>경도: {currentPosition.coords.longitude.toFixed(6)}°</div>
            <div>정확도: ±{Math.round(currentPosition.coords.accuracy)}m</div>
          </div>
        </div>
      )}

      {/* 오류 메시지 */}
      {locationError && (
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-bold text-red-600 text-sm">위치 오류</span>
          </div>
          <p className="text-red-600 text-xs">{locationError}</p>
        </div>
      )}
    </div>
  );
};

export default GameMap;