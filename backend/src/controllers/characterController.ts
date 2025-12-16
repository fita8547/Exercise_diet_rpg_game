import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Character from '../models/Character';

export const getCharacter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    res.json(character);
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createCharacter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Character name is required' });
      return;
    }

    // Check if character already exists
    const existingCharacter = await Character.findOne({ userId: req.userId });
    if (existingCharacter) {
      res.status(400).json({ error: 'Character already exists' });
      return;
    }

    const character = new Character({
      userId: req.userId,
      name
    });

    await character.save();
    res.status(201).json(character);
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCharacter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    // Update allowed fields
    const { health, stamina, position, physicalCondition } = req.body;
    
    if (health !== undefined) character.health = Math.max(0, Math.min(health, character.maxHealth));
    if (stamina !== undefined) character.stamina = Math.max(0, Math.min(stamina, character.maxStamina));
    if (position) character.position = position;
    if (physicalCondition) {
      character.physicalCondition.activityLevel = physicalCondition.activityLevel;
      character.physicalCondition.lastUpdated = new Date();
    }

    await character.save();
    res.json(character);
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const levelUp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    // Calculate experience needed for next level
    const experienceNeeded = character.level * 100;
    
    if (character.experience >= experienceNeeded) {
      character.level += 1;
      character.experience -= experienceNeeded;
      
      // Increase stats
      character.maxHealth += 10;
      character.health = character.maxHealth;
      character.maxStamina += 10;
      character.stamina = character.maxStamina;
      character.attack += 2;
      character.defense += 1;
      
      await character.save();
      res.json({ message: 'Level up!', character });
    } else {
      res.status(400).json({ error: 'Not enough experience' });
    }
  } catch (error) {
    console.error('Level up error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
