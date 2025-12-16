import React from 'react';
import { Character } from '../types';
import { characterAPI } from '../services/api';

interface CharacterStatsProps {
  character: Character;
  onUpdate: () => void;
}

const CharacterStats: React.FC<CharacterStatsProps> = ({ character, onUpdate }) => {
  const experienceNeeded = character.level * 100;
  const experienceProgress = (character.experience / experienceNeeded) * 100;

  const handleLevelUp = async () => {
    try {
      await characterAPI.levelUp();
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Cannot level up yet');
    }
  };

  const activityLevelColors = {
    sedentary: 'text-gray-400',
    light: 'text-blue-400',
    moderate: 'text-green-400',
    active: 'text-yellow-400',
    very_active: 'text-purple-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Character Info */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">{character.name}</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Level</span>
            <span className="text-xl font-bold text-white">{character.level}</span>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Experience</span>
              <span className="text-gray-300">{character.experience} / {experienceNeeded}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(experienceProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          {character.experience >= experienceNeeded && (
            <button
              onClick={handleLevelUp}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
            >
              Level Up!
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Stats</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Health</span>
              <span className="text-gray-300">{character.health} / {character.maxHealth}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full transition-all"
                style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Stamina</span>
              <span className="text-gray-300">{character.stamina} / {character.maxStamina}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-yellow-600 h-3 rounded-full transition-all"
                style={{ width: `${(character.stamina / character.maxStamina) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-gray-400 text-sm">Attack</div>
              <div className="text-2xl font-bold text-red-400">{character.attack}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm">Defense</div>
              <div className="text-2xl font-bold text-blue-400">{character.defense}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Status */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Physical Condition</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Activity Level</span>
            <span className={`text-xl font-bold capitalize ${activityLevelColors[character.physicalCondition.activityLevel]}`}>
              {character.physicalCondition.activityLevel.replace('_', ' ')}
            </span>
          </div>

          <div className="text-sm text-gray-400">
            Last Updated: {new Date(character.physicalCondition.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Combat Record */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Combat Record</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-gray-400 text-sm">Victories</div>
            <div className="text-3xl font-bold text-green-400">{character.victories}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm">Defeats</div>
            <div className="text-3xl font-bold text-red-400">{character.defeats}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm">Win Rate</div>
            <div className="text-3xl font-bold text-yellow-400">
              {character.victories + character.defeats > 0
                ? Math.round((character.victories / (character.victories + character.defeats)) * 100)
                : 0}%
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Steps</span>
            <span className="text-white font-semibold">{character.totalSteps.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-400">Distance Traveled</span>
            <span className="text-white font-semibold">{(character.totalDistance / 1000).toFixed(2)} km</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterStats;
