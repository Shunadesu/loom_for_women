import { Router } from 'express';
import { listActiveHeroes } from '../controllers/heroController.js';

const router = Router();

router.get('/', listActiveHeroes);

export default router;