import express from 'express';

import * as user from '../controllers/user.js';
import { validateJWT, validateUser } from '../middleware/userMiddleware.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

router.post('/login', catchAsync(user.login));

router.post('/register', validateUser, catchAsync(user.register));

router.get('/profile', validateJWT, user.getProfileData);

export default router;
