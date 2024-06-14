import express from 'express';

import * as fridge from '../controllers/fridge.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

router.post('/create', fridge.createIngredients);

export default router;