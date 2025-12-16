import express from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { 
  getCharacter, 
  createCharacter, 
  updateCharacter, 
  levelUp 
} from '../controllers/characterController';

const router = express.Router();

router.get('/', apiLimiter, authenticate, getCharacter);
router.post('/', apiLimiter, authenticate, createCharacter);
router.put('/', apiLimiter, authenticate, updateCharacter);
router.post('/levelup', apiLimiter, authenticate, levelUp);

export default router;
