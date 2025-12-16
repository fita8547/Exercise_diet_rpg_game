import React, { useState, useEffect } from 'react';
import { Character, Activity, ConditionAnalysis } from '../types';
import { activityAPI } from '../services/api';

interface ActivityTrackerProps {
  character: Character;
  onUpdate: () => void;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ character, onUpdate }) => {
  const [activityType, setActivityType] = useState<'walking' | 'running' | 'exercise' | 'other'>('walking');
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [analysis, setAnalysis] = useState<ConditionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useGPS, setUseGPS] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    loadActivities();
    loadAnalysis();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await activityAPI.getAll(10);
      setActivities(response.data);
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  };

  const loadAnalysis = async () => {
    try {
      const response = await activityAPI.analyzeCondition();
      setAnalysis(response.data);
    } catch (err) {
      console.error('Failed to load analysis:', err);
    }
  };

  const handleGPSToggle = () => {
    if (!useGPS && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setUseGPS(true);
        },
        (error) => {
          alert('Failed to get location: ' + error.message);
        }
      );
    } else {
      setUseGPS(false);
      setLocation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        activityType,
        steps: steps ? parseInt(steps) : undefined,
        distance: distance ? parseFloat(distance) : undefined,
        duration: parseInt(duration),
        calories: calories ? parseInt(calories) : undefined,
        location: useGPS && location ? location : undefined,
      };

      await activityAPI.log(data);
      
      // Reset form
      setSteps('');
      setDistance('');
      setDuration('');
      setCalories('');
      setUseGPS(false);
      setLocation(null);
      
      // Reload data
      await loadActivities();
      await loadAnalysis();
      onUpdate();
      
      alert('Activity logged successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to log activity');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Log Activity Form */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">Log Activity</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Activity Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="walking">Walking</option>
              <option value="running">Running</option>
              <option value="exercise">Exercise</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Steps (optional)</label>
              <input
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                min="0"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Distance (m)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Duration (min) *</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Calories (optional)</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="gps"
              checked={useGPS}
              onChange={handleGPSToggle}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-600"
            />
            <label htmlFor="gps" className="ml-2 text-gray-300">
              Use GPS Location {location && '✓'}
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition disabled:bg-gray-600"
          >
            {isLoading ? 'Logging...' : 'Log Activity'}
          </button>
        </form>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">AI Body Condition Analysis</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Activity Level</div>
              <div className="text-2xl font-bold text-purple-400 capitalize">
                {analysis.activityLevel.replace('_', ' ')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400 text-xs">Avg Steps/Day</div>
                <div className="text-lg font-bold text-white">{analysis.metrics.avgStepsPerDay}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400 text-xs">Total Steps</div>
                <div className="text-lg font-bold text-white">{analysis.metrics.totalSteps}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400 text-xs">Total Distance</div>
                <div className="text-lg font-bold text-white">{(analysis.metrics.totalDistance / 1000).toFixed(1)} km</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400 text-xs">Activities</div>
                <div className="text-lg font-bold text-white">{analysis.metrics.activitiesLogged}</div>
              </div>
            </div>

            <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4">
              <div className="text-purple-300 font-semibold mb-2">Recommendation</div>
              <div className="text-gray-300 text-sm">{analysis.recommendation}</div>
            </div>

            <div className="text-xs text-gray-500 italic">
              {analysis.disclaimer}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl lg:col-span-2">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">Recent Activities</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-2 text-gray-400">Type</th>
                <th className="pb-2 text-gray-400">Steps</th>
                <th className="pb-2 text-gray-400">Distance</th>
                <th className="pb-2 text-gray-400">Duration</th>
                <th className="pb-2 text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id} className="border-b border-gray-700">
                  <td className="py-2 capitalize">{activity.activityType}</td>
                  <td className="py-2">{activity.steps}</td>
                  <td className="py-2">{(activity.distance / 1000).toFixed(2)} km</td>
                  <td className="py-2">{activity.duration} min</td>
                  <td className="py-2 text-gray-400 text-sm">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {activities.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No activities logged yet. Start moving to gain experience!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
