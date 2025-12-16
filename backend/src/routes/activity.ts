import express from 'express';
import { authenticate } from '../middleware/auth';
import { activityLimiter, apiLimiter } from '../middleware/rateLimiter';
import { 
  logActivity, 
  getActivities, 
  analyzeCondition 
} from '../controllers/activityController';

const router = express.Router();

router.post('/', activityLimiter, authenticate, logActivity);
router.get('/', apiLimiter, authenticate, getActivities);
router.get('/analyze', apiLimiter, authenticate, analyzeCondition);

export default router;
