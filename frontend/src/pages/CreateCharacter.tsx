import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { characterAPI } from '../services/api';

const CreateCharacter: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await characterAPI.create(name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create character');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Create Your Hero</h1>
        <p className="text-center text-gray-600 mb-6">Choose a name for your character</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Character Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter character name"
              required
              minLength={2}
              maxLength={30}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
          >
            {isLoading ? 'Creating...' : 'Create Character'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> Your character's stats will improve as you exercise and move in real life. 
            Walking, running, and physical activity will make your character stronger!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacter;
