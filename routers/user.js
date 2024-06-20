import express from 'express';

import * as user from '../controllers/user.js';
import { validateUser } from '../middleware/userMiddleware.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

router.post('/login', user.login);

router.post('/register', validateUser, catchAsync(user.register));

export default router;
