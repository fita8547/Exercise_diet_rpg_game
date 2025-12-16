import React from 'react';
import { Character } from '../types';

interface MapViewProps {
  character: Character;
}

const MapView: React.FC<MapViewProps> = ({ character }) => {
  const gridSize = 20;
  const cellSize = 30;
  
  // Center the map around the character's position
  const viewOffsetX = Math.floor(character.position.x / gridSize) * gridSize;
  const viewOffsetY = Math.floor(character.position.y / gridSize) * gridSize;

  const renderGrid = () => {
    const cells = [];
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const worldX = viewOffsetX + x;
        const worldY = viewOffsetY + y;
        const isPlayerPosition = worldX === character.position.x && worldY === character.position.y;
        
        // Determine cell type based on position (simple procedural generation)
        let cellClass = 'bg-gray-700';
        let cellContent = '';
        
        if (isPlayerPosition) {
          cellClass = 'bg-purple-600';
          cellContent = '👤';
        } else {
          const hash = (worldX * 7919 + worldY * 7877) % 100;
          
          if (hash < 5) {
            cellClass = 'bg-red-900';
            cellContent = '⚔️';
          } else if (hash < 10) {
            cellClass = 'bg-green-900';
            cellContent = '🌳';
          } else if (hash < 15) {
            cellClass = 'bg-blue-900';
            cellContent = '💧';
          } else if (hash < 20) {
            cellClass = 'bg-yellow-900';
            cellContent = '⭐';
          } else {
            cellClass = 'bg-gray-700';
          }
        }

        cells.push(
          <div
            key={`${worldX}-${worldY}`}
            className={`${cellClass} border border-gray-600 flex items-center justify-center text-xs`}
            style={{ width: cellSize, height: cellSize }}
            title={`(${worldX}, ${worldY})`}
          >
            {cellContent}
          </div>
        );
      }
    }
    
    return cells;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-3xl font-bold text-purple-400 mb-4">World Map</h2>
        
        <div className="mb-4 bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Your Position</div>
              <div className="text-white font-bold">
                ({character.position.x}, {character.position.y})
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Distance Traveled</div>
              <div className="text-white font-bold">
                {(character.totalDistance / 1000).toFixed(2)} km
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Total Steps</div>
              <div className="text-white font-bold">
                {character.totalSteps.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Map Region</div>
              <div className="text-white font-bold">
                Zone {Math.floor(character.position.x / 50)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
          <div 
            className="grid gap-0 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
              width: 'fit-content'
            }}
          >
            {renderGrid()}
          </div>
        </div>

        <div className="mt-4 bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-bold text-purple-400 mb-2">Map Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span className="text-gray-300">Your Position</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚔️</span>
              <span className="text-gray-300">Enemy Territory</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌳</span>
              <span className="text-gray-300">Forest</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💧</span>
              <span className="text-gray-300">Water</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <span className="text-gray-300">Points of Interest</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-purple-900 bg-opacity-30 rounded-lg p-4">
          <p className="text-gray-300 text-sm">
            <strong className="text-purple-400">Pro Tip:</strong> Your position on the map updates based on 
            your real-world movement! Walk, run, or exercise to explore new areas and discover challenges.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
