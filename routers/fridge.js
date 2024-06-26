import express from 'express';

import * as fridge from '../controllers/fridge.js';
import { validateJWT, upload } from '../middleware/userMiddleware.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

router.post('/create', validateJWT, catchAsync(fridge.createIngredients));

router.post(
  '/createByPhoto',
  upload.single('image'),
  catchAsync(fridge.createByPhoto),
);

router.get('/', validateJWT, catchAsync(fridge.renderFridgeById));

router.get('/recipeDetails', catchAsync(fridge.renderRecipeById));

router.post('/recipe', catchAsync(fridge.recommendRecipe));

export default router;
