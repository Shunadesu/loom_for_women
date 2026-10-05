import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  addFavorite,
  removeFavorite,
  myFavorites,
} from '../controllers/favoriteController.js';

const router = Router();
router.use(requireAuth);

router.get('/me', myFavorites);
router.post('/courses/:id', addFavorite);
router.delete('/courses/:id', removeFavorite);

export default router;