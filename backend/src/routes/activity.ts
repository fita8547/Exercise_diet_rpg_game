import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  logActivity, 
  getActivities, 
  analyzeCondition 
} from '../controllers/activityController';

const router = express.Router();

router.post('/', authenticate, logActivity);
router.get('/', authenticate, getActivities);
router.get('/analyze', authenticate, analyzeCondition);

export default router;
