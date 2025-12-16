import express from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { 
  startCombat, 
  executeTurn, 
  getCombatHistory,
  getCurrentCombat 
} from '../controllers/combatController';

const router = express.Router();

router.post('/start', apiLimiter, authenticate, startCombat);
router.post('/:combatId/turn', apiLimiter, authenticate, executeTurn);
router.get('/history', apiLimiter, authenticate, getCombatHistory);
router.get('/current', apiLimiter, authenticate, getCurrentCombat);

export default router;
