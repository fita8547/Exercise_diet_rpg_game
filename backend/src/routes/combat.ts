import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  startCombat, 
  executeTurn, 
  getCombatHistory,
  getCurrentCombat 
} from '../controllers/combatController';

const router = express.Router();

router.post('/start', authenticate, startCombat);
router.post('/:combatId/turn', authenticate, executeTurn);
router.get('/history', authenticate, getCombatHistory);
router.get('/current', authenticate, getCurrentCombat);

export default router;
