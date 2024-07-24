import express from 'express';

import * as user from '../controllers/userControllers.js';
import { validateJWT, validateUser } from '../middleware/userMiddleware.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

router.post('/login', catchAsync(user.login));

router.get('/logout', user.logout);

router.post('/register', validateUser, catchAsync(user.register));

router.post('/createGroup', validateJWT, catchAsync(user.createGroup));

router.get(
  '/validateInvitation',
  validateJWT,
  catchAsync(user.validateInvitation),
);

router
  .route('/profile')
  .get(validateJWT, catchAsync(user.getProfileData))
  .put(validateJWT, catchAsync(user.updatePreferenceAndOmit));

router.get('/notifications', validateJWT, catchAsync(user.getNotifications));

router.get('/info', validateJWT, catchAsync(user.getUserInfo));

router.get(
  '/countNotifications',
  validateJWT,
  catchAsync(user.countNotifications),
);

router.put('/updateLikes', validateJWT, catchAsync(user.updateLikes));

router.put(
  '/updateReceiveNotifications',
  validateJWT,
  catchAsync(user.updateReceiveNotifications),
);

router.get('/likedRecipes', validateJWT, catchAsync(user.getLikedRecipes));

export default router;
