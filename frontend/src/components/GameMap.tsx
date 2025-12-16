import React, { useState, useEffect } from 'react';
import { MapPin, Swords, Crown, Skull, Gem, Shield, Target, Navigation } from 'lucide-react';

interface GameMapProps {
  mapData?: any[][];
  nextTarget?: any;
  encounterGauge?: number;
  onCellClick?: (cell: any) => void;
}

const GameMap: React.FC<GameMapProps> = ({ 
  mapData = [], 
  nextTarget, 
  encounterGauge = 0,
  onCellClick 
}) => {
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const getCellIcon = (cell: any) => {
    if (cell.isPlayer) return <MapPin className="w-6 h-6 text-yellow-800" />;
    
    switch (cell.type) {
      case 'monster':
        return <Skull className="w-4 h-4 text-red-600" />;
      case 'dungeon':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'treasure':
        return <Gem className="w-4 h-4 text-blue-600" />;
      case 'safe':
        return <Shield className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getCellStyle = (cell: any) => {
    let baseStyle = "w-16 h-16 border-2 flex items-center justify-center relative cursor-pointer transition-all hover:scale-105 ";
    
    if (cell.isPlayer) {
      return baseStyle + "bg-yellow-400 border-yellow-600 shadow-lg";
    }
    
    switch (cell.type) {
      case 'monster':
        return baseStyle + "bg-red-100 border-red-300 hover:bg-red-200";
      case 'dungeon':
        return baseStyle + "bg-purple-100 border-purple-300 hover:bg-purple-200";
      case 'treasure':
        return baseStyle + "bg-blue-100 border-blue-300 hover:bg-blue-200";
      case 'safe':
        return baseStyle + "bg-green-100 border-green-300 hover:bg-green-200";
      default:
        return baseStyle + "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
    }
  };

  const handleCellClick = (cell: any) => {
    setSelectedCell(cell);
    if (onCellClick) {
      onCellClick(cell);
    }
  };

  const renderGrid = () => {
    if (!mapData || mapData.length === 0) {
      return (
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => (
            <div key={i} className="w-16 h-16 bg-gray-200 border border-gray-300 rounded"></div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-5 gap-1">
        {mapData.flat().map((cell, index) => (
          <div
            key={`${cell.x}-${cell.y}-${index}`}
            className={getCellStyle(cell)}
            onClick={() => handleCellClick(cell)}
            title={`${cell.type} (${cell.x}, ${cell.y})`}
          >
            {getCellIcon(cell)}
            
            {/* 거리 표시 */}
            {!cell.isPlayer && cell.distanceFromPlayer > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-white text-xs px-1 rounded border">
                {cell.distanceFromPlayer.toFixed(0)}
              </div>
            )}
            
            {/* 다음 목표 표시 */}
            {nextTarget && cell.x === nextTarget.x && cell.y === nextTarget.y && (
              <div className="absolute -top-2 -right-2">
                <Target className="w-4 h-4 text-yellow-600 animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 border-4 border-yellow-400">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-yellow-600" />
          <h3 className="font-bold text-black">모험 지도</h3>
        </div>
        
        {/* 조우 게이지 */}
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-red-600" />
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-full rounded-full transition-all"
              style={{ width: `${encounterGauge}%` }}
            ></div>
          </div>
          <span className="text-xs text-black">{encounterGauge}%</span>
        </div>
      </div>

      {/* 5x5 그리드 */}
      <div className="mb-4 flex justify-center">
        {renderGrid()}
      </div>

      {/* 다음 목표 정보 */}
      {nextTarget && (
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-yellow-600" />
            <span className="font-bold text-black text-sm">다음 목표</span>
          </div>
          <div className="text-sm text-black">
            <div>{nextTarget.direction}으로 {nextTarget.realDistanceMeters}m</div>
            <div className="text-xs text-gray-600">
              {nextTarget.content?.name || nextTarget.type}
              {nextTarget.content?.level && ` (Lv.${nextTarget.content.level})`}
            </div>
          </div>
        </div>
      )}

      {/* 선택된 셀 정보 */}
      {selectedCell && (
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="font-bold text-black text-sm mb-1">
            셀 정보 ({selectedCell.x}, {selectedCell.y})
          </div>
          <div className="text-sm text-black">
            <div>타입: {selectedCell.type}</div>
            {selectedCell.content && (
              <div>내용: {JSON.stringify(selectedCell.content, null, 2)}</div>
            )}
            {selectedCell.distanceFromPlayer > 0 && (
              <div>거리: {selectedCell.distanceFromPlayer.toFixed(1)} 칸</div>
            )}
          </div>
        </div>
      )}

      {/* 범례 */}
      <div className="mt-3 pt-3 border-t-2 border-yellow-200">
        <div className="text-xs text-black space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-yellow-800" />
              <span>현재 위치</span>
            </div>
            <div className="flex items-center gap-2">
              <Skull className="w-3 h-3 text-red-600" />
              <span>몬스터</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-3 h-3 text-purple-600" />
              <span>던전</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-3 h-3 text-blue-600" />
              <span>보물</span>
            </div>
          </div>
        </div>
      </div>

      {/* 이동 가이드 */}
      <div className="mt-3 bg-yellow-50 p-2 rounded border border-yellow-200">
        <p className="text-xs text-black">
          💡 실제로 걸어서 이동하면 맵이 업데이트되고 몬스터를 만날 수 있습니다!
        </p>
      </div>
    </div>
  );
};

export default GameMap;