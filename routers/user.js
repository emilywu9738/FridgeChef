import express from 'express';

import * as user from '../controllers/user.js';
import { validateJWT, validateUser } from '../middleware/userMiddleware.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

router.post('/login', catchAsync(user.login));

router.get('/logout', user.logout);

router.post('/register', validateUser, catchAsync(user.register));

router.get('/search', catchAsync(user.searchUser));

router
  .route('/createGroup')
  .post(validateJWT, catchAsync(user.createGroup))
  .get(validateJWT, catchAsync(user.validateInvitation));

router
  .route('/profile')
  .get(validateJWT, catchAsync(user.getProfileData))
  .post(validateJWT, catchAsync(user.updatePreferenceAndOmit));

router.get('/notifications', validateJWT, catchAsync(user.getNotifications));

router.get('/info', validateJWT, user.getUserInfo);

router.get(
  '/countNotifications',
  validateJWT,
  catchAsync(user.countNotifications),
);

router.post('/updateLikes', validateJWT, user.updateLikes);

export default router;
