import express from 'express';

import * as user from '../controllers/user.js';

const router = express.Router();

router.post('/login', user.login);

router.post('/register', user.register);

export default router;
