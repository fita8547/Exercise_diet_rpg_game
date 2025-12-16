import React, { useState, useEffect } from 'react';
import { Character, Combat } from '../types';
import { combatAPI } from '../services/api';

interface CombatArenaProps {
  character: Character;
  onUpdate: () => void;
}

const CombatArena: React.FC<CombatArenaProps> = ({ character, onUpdate }) => {
  const [combat, setCombat] = useState<Combat | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkActiveCombat();
  }, []);

  const checkActiveCombat = async () => {
    try {
      const response = await combatAPI.getCurrent();
      setCombat(response.data);
    } catch (err) {
      // No active combat
      setCombat(null);
    }
  };

  const startNewCombat = async () => {
    setIsLoading(true);
    try {
      const response = await combatAPI.start();
      setCombat(response.data);
      setCombatLog(['A wild enemy appears!']);
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start combat');
    } finally {
      setIsLoading(false);
    }
  };

  const executeTurn = async (action: 'attack' | 'defend') => {
    if (!combat) return;
    
    setIsLoading(true);
    try {
      const response = await combatAPI.executeTurn(combat._id, action);
      setCombat(response.data.combat);
      setCombatLog([...combatLog, response.data.message]);
      
      if (response.data.gameOver) {
        setTimeout(() => {
          alert(response.data.message);
          setCombat(null);
          setCombatLog([]);
          onUpdate();
        }, 500);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Combat action failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!combat) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl text-center">
          <h2 className="text-3xl font-bold text-purple-400 mb-4">Combat Arena</h2>
          <p className="text-gray-300 mb-6">
            Test your strength in turn-based combat! Your real-world activity affects combat difficulty.
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-sm">Stamina Required</div>
                <div className="text-2xl font-bold text-yellow-400">20</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Current Stamina</div>
                <div className="text-2xl font-bold text-white">{character.stamina}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Your Level</div>
                <div className="text-2xl font-bold text-purple-400">{character.level}</div>
              </div>
            </div>
          </div>

          {character.stamina >= 20 ? (
            <button
              onClick={startNewCombat}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition disabled:bg-gray-600"
            >
              {isLoading ? 'Preparing...' : 'Start Combat'}
            </button>
          ) : (
            <div className="text-yellow-400">
              Not enough stamina! Go for a walk or run to recover.
            </div>
          )}
        </div>
      </div>
    );
  }

  const enemyHealthPercent = (combat.enemyHealth / combat.enemyMaxHealth) * 100;
  const playerHealthPercent = (combat.playerHealthCurrent / combat.playerHealthAtStart) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center">
          Battle in Progress - Turn {combat.turn}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player */}
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-400 mb-4">{character.name}</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Health</span>
                  <span className="text-gray-300">{combat.playerHealthCurrent} / {combat.playerHealthAtStart}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-4">
                  <div
                    className="bg-red-600 h-4 rounded-full transition-all"
                    style={{ width: `${playerHealthPercent}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="text-gray-400 text-xs">Attack</div>
                  <div className="text-xl font-bold text-red-400">{character.attack}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Defense</div>
                  <div className="text-xl font-bold text-blue-400">{character.defense}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enemy */}
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-400 mb-4">
              {combat.enemyName} (Lv.{combat.enemyLevel})
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Health</span>
                  <span className="text-gray-300">{combat.enemyHealth} / {combat.enemyMaxHealth}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-4">
                  <div
                    className="bg-red-600 h-4 rounded-full transition-all"
                    style={{ width: `${enemyHealthPercent}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="text-gray-400 text-xs">Attack</div>
                  <div className="text-xl font-bold text-red-400">{combat.enemyAttack}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Defense</div>
                  <div className="text-xl font-bold text-blue-400">{combat.enemyDefense}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combat Actions */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => executeTurn('attack')}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition disabled:bg-gray-600"
          >
            ⚔️ Attack
          </button>
          <button
            onClick={() => executeTurn('defend')}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition disabled:bg-gray-600"
          >
            🛡️ Defend
          </button>
        </div>

        {/* Combat Log */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-bold text-purple-400 mb-2">Combat Log</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {combatLog.map((log, index) => (
              <div key={index} className="text-gray-300 text-sm">
                → {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatArena;
