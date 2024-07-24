import express from 'express';

import * as fridge from '../controllers/fridgeControllers.js';
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

router.post('/recipe', catchAsync(fridge.recommendRecipe));

router.get(
  '/recipeBySimilarity',
  catchAsync(fridge.recommendRecipeOnDetailPage),
);

router.delete('/:id/deleteItems', validateJWT, catchAsync(fridge.deleteItems));

router.get('/searchUserForInvite', catchAsync(fridge.searchUserForInvite));

router.get('/inviteMember', validateJWT, catchAsync(fridge.inviteMember));

export default router;
