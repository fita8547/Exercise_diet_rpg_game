import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getCharacter, 
  createCharacter, 
  updateCharacter, 
  levelUp 
} from '../controllers/characterController';

const router = express.Router();

router.get('/', authenticate, getCharacter);
router.post('/', authenticate, createCharacter);
router.put('/', authenticate, updateCharacter);
router.post('/levelup', authenticate, levelUp);

export default router;
