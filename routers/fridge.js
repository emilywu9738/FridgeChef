import express from 'express';

import * as fridge from '../controllers/fridge.js';
import { validateJWT } from '../middleware/userMiddleware.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

router.post('/create', catchAsync(fridge.createIngredients));

router.get('/', validateJWT, catchAsync(fridge.renderFridgeById));

router.post('/recipe', catchAsync(fridge.recommendRecipe));

export default router;
