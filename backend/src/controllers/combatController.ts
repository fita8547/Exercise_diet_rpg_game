import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Combat from '../models/Combat';
import Character from '../models/Character';

// Enemy templates based on player level
const generateEnemy = (playerLevel: number, activityLevel: string) => {
  const enemyNames = ['Shadow Beast', 'Forest Troll', 'Mountain Ogre', 'Dark Knight', 'Dragon'];
  const enemyIndex = Math.min(Math.floor(playerLevel / 5), enemyNames.length - 1);
  const name = enemyNames[enemyIndex];
  
  // Adjust enemy difficulty based on player's activity level
  const difficultyMultiplier = activityLevel === 'very_active' ? 1.2 : 
                               activityLevel === 'active' ? 1.1 :
                               activityLevel === 'moderate' ? 1.0 :
                               activityLevel === 'light' ? 0.9 : 0.8;
  
  const level = Math.max(1, Math.floor(playerLevel * 0.8 * difficultyMultiplier));
  const maxHealth = Math.floor((50 + level * 15) * difficultyMultiplier);
  const attack = Math.floor((5 + level * 2) * difficultyMultiplier);
  const defense = Math.floor((3 + level * 1) * difficultyMultiplier);
  
  return { name, level, maxHealth, health: maxHealth, attack, defense };
};

export const startCombat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    // Check if there's already an active combat
    const activeCombat = await Combat.findOne({ userId: req.userId, status: 'active' });
    if (activeCombat) {
      res.status(400).json({ error: 'Already in combat', combat: activeCombat });
      return;
    }

    // Check stamina
    if (character.stamina < 20) {
      res.status(400).json({ error: 'Not enough stamina. Go for a walk to recover!' });
      return;
    }

    // Generate enemy based on character level and activity
    const enemy = generateEnemy(character.level, character.physicalCondition.activityLevel);

    // Create new combat
    const combat = new Combat({
      userId: req.userId,
      enemyName: enemy.name,
      enemyLevel: enemy.level,
      enemyHealth: enemy.health,
      enemyMaxHealth: enemy.maxHealth,
      enemyAttack: enemy.attack,
      enemyDefense: enemy.defense,
      playerHealthAtStart: character.health,
      playerHealthCurrent: character.health
    });

    await combat.save();

    // Deduct stamina
    character.stamina = Math.max(0, character.stamina - 20);
    await character.save();

    res.status(201).json(combat);
  } catch (error) {
    console.error('Start combat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const executeTurn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action } = req.body;
    const combatId = req.params.combatId;

    if (!action || (action !== 'attack' && action !== 'defend')) {
      res.status(400).json({ error: 'Invalid action. Must be attack or defend.' });
      return;
    }

    const combat = await Combat.findOne({ _id: combatId, userId: req.userId, status: 'active' });
    if (!combat) {
      res.status(404).json({ error: 'Combat not found or already ended' });
      return;
    }

    const character = await Character.findOne({ userId: req.userId });
    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    let message = '';

    // Player's turn
    if (action === 'attack') {
      const damage = Math.max(1, character.attack - combat.enemyDefense + Math.floor(Math.random() * 5));
      combat.enemyHealth = Math.max(0, combat.enemyHealth - damage);
      message += `You dealt ${damage} damage. `;
    } else if (action === 'defend') {
      // Defending increases defense temporarily (reflected in next enemy attack)
      message += 'You take a defensive stance. ';
    }

    // Check if enemy is defeated
    if (combat.enemyHealth <= 0) {
      combat.status = 'victory';
      const expGained = combat.enemyLevel * 20;
      combat.experienceGained = expGained;
      
      character.experience += expGained;
      character.victories += 1;
      await character.save();
      await combat.save();

      res.json({
        combat,
        message: message + `Victory! You gained ${expGained} experience.`,
        gameOver: true
      });
      return;
    }

    // Enemy's turn
    const enemyDamage = action === 'defend' 
      ? Math.max(1, Math.floor((combat.enemyAttack - character.defense * 1.5) + Math.random() * 3))
      : Math.max(1, combat.enemyAttack - character.defense + Math.floor(Math.random() * 3));
    
    combat.playerHealthCurrent = Math.max(0, combat.playerHealthCurrent - enemyDamage);
    character.health = combat.playerHealthCurrent;
    message += `Enemy dealt ${enemyDamage} damage.`;

    // Check if player is defeated
    if (combat.playerHealthCurrent <= 0) {
      combat.status = 'defeat';
      character.defeats += 1;
      await character.save();
      await combat.save();

      res.json({
        combat,
        message: message + ' Defeat! Rest and try again.',
        gameOver: true
      });
      return;
    }

    combat.turn += 1;
    await combat.save();
    await character.save();

    res.json({
      combat,
      message,
      gameOver: false
    });
  } catch (error) {
    console.error('Execute turn error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCombatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const combats = await Combat.find({ userId: req.userId, status: { $ne: 'active' } })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(combats);
  } catch (error) {
    console.error('Get combat history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCurrentCombat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const combat = await Combat.findOne({ userId: req.userId, status: 'active' });
    
    if (!combat) {
      res.status(404).json({ error: 'No active combat' });
      return;
    }

    res.json(combat);
  } catch (error) {
    console.error('Get current combat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
