import React from 'react';
import { MapPin, Swords, Crown, Skull } from 'lucide-react';

interface SimpleMapProps {
  currentRegion: string;
  playerPosition?: { latitude: number; longitude: number };
  nearbyDungeons?: Array<{
    dungeonId: string;
    name: string;
    requiredLevel: number;
    canEnter: boolean;
  }>;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  currentRegion, 
  playerPosition, 
  nearbyDungeons = [] 
}) => {
  // 지역을 그리드로 표시
  const getRegionGrid = (regionId: string) => {
    const match = regionId.match(/region_(\d+)_(\d+)/);
    if (match) {
      return { x: parseInt(match[1]), y: parseInt(match[2]) };
    }
    return { x: 9, y: 9 }; // 기본값
  };

  const currentGrid = getRegionGrid(currentRegion);
  
  // 3x3 그리드로 주변 지역 표시
  const renderGrid = () => {
    const grid = [];
    for (let y = currentGrid.y - 1; y <= currentGrid.y + 1; y++) {
      for (let x = currentGrid.x - 1; x <= currentGrid.x + 1; x++) {
        const isCurrentRegion = x === currentGrid.x && y === currentGrid.y;
        const regionId = `region_${x}_${y}`;
        const hasDungeon = nearbyDungeons.some(d => d.dungeonId.includes(regionId));
        
        grid.push(
          <div
            key={`${x}-${y}`}
            className={`
              w-16 h-16 border-2 flex items-center justify-center relative
              ${isCurrentRegion 
                ? 'bg-yellow-400 border-yellow-600' 
                : 'bg-yellow-100 border-yellow-300'
              }
            `}
          >
            {isCurrentRegion && (
              <MapPin className="w-6 h-6 text-yellow-800" />
            )}
            {hasDungeon && !isCurrentRegion && (
              <Swords className="w-4 h-4 text-yellow-600" />
            )}
            {hasDungeon && isCurrentRegion && (
              <div className="absolute top-0 right-0">
                <Skull className="w-3 h-3 text-red-600" />
              </div>
            )}
          </div>
        );
      }
    }
    return grid;
  };

  return (
    <div className="bg-white rounded-lg p-4 border-4 border-yellow-400">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-5 h-5 text-yellow-600" />
        <h3 className="font-bold text-black">모험 지도</h3>
      </div>
      
      {/* 3x3 그리드 지도 */}
      <div className="grid grid-cols-3 gap-1 mb-4 justify-center">
        {renderGrid()}
      </div>

      {/* 현재 위치 정보 */}
      <div className="text-sm text-black space-y-1">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-yellow-600" />
          <span>현재 지역: {currentRegion}</span>
        </div>
        
        {playerPosition && (
          <div className="text-xs text-gray-600">
            좌표: {playerPosition.latitude.toFixed(4)}, {playerPosition.longitude.toFixed(4)}
          </div>
        )}
      </div>

      {/* 범례 */}
      <div className="mt-3 pt-3 border-t-2 border-yellow-200">
        <div className="text-xs text-black space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 border border-yellow-600"></div>
            <span>현재 위치</span>
          </div>
          <div className="flex items-center gap-2">
            <Swords className="w-3 h-3 text-yellow-600" />
            <span>던전 위치</span>
          </div>
          <div className="flex items-center gap-2">
            <Skull className="w-3 h-3 text-red-600" />
            <span>현재 지역 던전</span>
          </div>
        </div>
      </div>

      {/* 이동 가이드 */}
      <div className="mt-3 bg-yellow-50 p-2 rounded border border-yellow-200">
        <p className="text-xs text-black">
          💡 실제로 걸어서 다른 지역으로 이동하면 새로운 던전을 발견할 수 있습니다!
        </p>
      </div>
    </div>
  );
};

export default SimpleMap;