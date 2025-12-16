import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Activity from '../models/Activity';
import Character from '../models/Character';

export const logActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { activityType, steps, distance, duration, calories, location } = req.body;

    if (!activityType || !duration) {
      res.status(400).json({ error: 'Activity type and duration are required' });
      return;
    }

    // Create activity log
    const activity = new Activity({
      userId: req.userId,
      activityType,
      steps: steps || 0,
      distance: distance || 0,
      duration,
      calories: calories || 0,
      location
    });

    await activity.save();

    // Update character stats
    const character = await Character.findOne({ userId: req.userId });
    if (character) {
      character.totalSteps += steps || 0;
      character.totalDistance += distance || 0;
      
      // Grant experience based on activity
      const experienceGain = Math.floor(duration / 60) * 5 + Math.floor((steps || 0) / 100);
      character.experience += experienceGain;
      
      // Restore stamina based on activity
      if (activityType === 'walking' || activityType === 'running') {
        character.stamina = Math.min(character.maxStamina, character.stamina + Math.floor(duration / 120));
      }
      
      // Update position based on distance (simplified grid movement)
      const movementUnits = Math.floor((distance || 0) / 100);
      character.position.x += movementUnits;
      
      await character.save();
    }

    res.status(201).json({ activity, experienceGained: Math.floor(duration / 60) * 5 });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await Activity.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const analyzeCondition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activities = await Activity.find({
      userId: req.userId,
      timestamp: { $gte: sevenDaysAgo }
    });

    // Calculate activity metrics
    const totalSteps = activities.reduce((sum, act) => sum + act.steps, 0);
    const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0);
    const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);
    const avgStepsPerDay = totalSteps / 7;

    // Determine activity level (ethical AI analysis, no medical advice)
    let activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    let recommendation: string;

    if (avgStepsPerDay < 3000) {
      activityLevel = 'sedentary';
      recommendation = 'Consider incorporating short walks into your daily routine for gradual improvement.';
    } else if (avgStepsPerDay < 5000) {
      activityLevel = 'light';
      recommendation = 'Good start! Try increasing your daily movement gradually.';
    } else if (avgStepsPerDay < 7500) {
      activityLevel = 'moderate';
      recommendation = 'Great progress! Maintain this level and consider varied activities.';
    } else if (avgStepsPerDay < 10000) {
      activityLevel = 'active';
      recommendation = 'Excellent activity level! Your character benefits greatly from your movement.';
    } else {
      activityLevel = 'very_active';
      recommendation = 'Outstanding dedication! Your character is at peak performance.';
    }

    // Update character's physical condition
    const character = await Character.findOne({ userId: req.userId });
    if (character) {
      character.physicalCondition.activityLevel = activityLevel;
      character.physicalCondition.lastUpdated = new Date();
      await character.save();
    }

    res.json({
      activityLevel,
      metrics: {
        avgStepsPerDay: Math.round(avgStepsPerDay),
        totalSteps,
        totalDistance: Math.round(totalDistance),
        totalDuration,
        activitiesLogged: activities.length
      },
      recommendation,
      disclaimer: 'This is game-based analysis and not medical advice. Consult healthcare professionals for health guidance.'
    });
  } catch (error) {
    console.error('Analyze condition error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
