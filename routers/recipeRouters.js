import express from 'express';

import * as recipe from '../controllers/recipeControllers.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

router.get('/search', catchAsync(recipe.searchRecipes));

router.get('/details', catchAsync(recipe.renderRecipeById));

export default router;
