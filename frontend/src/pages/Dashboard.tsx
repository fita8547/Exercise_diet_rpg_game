import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { characterAPI } from '../services/api';
import { Character } from '../types';
import CharacterStats from '../components/CharacterStats';
import ActivityTracker from '../components/ActivityTracker';
import CombatArena from '../components/CombatArena';
import MapView from '../components/MapView';

const Dashboard: React.FC = () => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'activity' | 'combat' | 'map'>('stats');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCharacter();
  }, []);

  const loadCharacter = async () => {
    try {
      const response = await characterAPI.get();
      setCharacter(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        navigate('/create-character');
      } else {
        setError('Failed to load character');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Health RPG</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            {[
              { key: 'stats', label: 'Character' },
              { key: 'activity', label: 'Activity' },
              { key: 'combat', label: 'Combat' },
              { key: 'map', label: 'Map' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 font-semibold transition ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {character && (
          <>
            {activeTab === 'stats' && <CharacterStats character={character} onUpdate={loadCharacter} />}
            {activeTab === 'activity' && <ActivityTracker character={character} onUpdate={loadCharacter} />}
            {activeTab === 'combat' && <CombatArena character={character} onUpdate={loadCharacter} />}
            {activeTab === 'map' && <MapView character={character} />}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
