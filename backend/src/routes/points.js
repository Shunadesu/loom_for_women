import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { myPoints, myTransactions } from '../controllers/pointController.js';

const router = Router();
router.use(requireAuth);

router.get('/me', myPoints);
router.get('/me/transactions', myTransactions);

export default router;