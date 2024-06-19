import mongoose from 'mongoose';
import 'dotenv/config';

import User from '../models/user.js';

mongoose.connect(process.env.MONGOOSE_CONNECT);

export const login = (req, res) => {
  res.send('login!');
};

export const register = (req, res) => {
  res.send('register!');
};
