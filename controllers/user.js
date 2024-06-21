import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';
import Fridge from '../models/fridge.js';
import ExpressError from '../utils/ExpressError.js';
import { generateJWT } from '../utils/JWT.js';
import { validateJWT } from '../middleware/userMiddleware.js';

mongoose.connect(process.env.MONGOOSE_CONNECT);

export const login = async (req, res) => {
  const { provider, email, password } = req.body;
  if (provider === 'native') {
    const [foundUser] = await User.find({ email });
    if (!foundUser) {
      throw new ExpressError('登入失敗！', 403);
    }
    const hashedPassword = foundUser.password;
    const id = foundUser._id.toString();
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      throw new ExpressError('登入失敗！', 403);
    }
    const accessToken = generateJWT(id);
    res.cookie('JWT', accessToken, {
      maxAge: 3600000,
      httpOnly: true,
    });
    res.json('登入成功');
  }
};

export const register = async (req, res) => {
  const { provider, name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  const [foundUser] = await User.find({ email });
  if (foundUser) {
    throw new ExpressError('使用者已存在，請直接登入', 403);
  }

  const user = new User({ provider, name, email, password: hashedPassword });
  const result = await user.save();
  const id = result._id.toString();

  const accessToken = generateJWT(id);
  res.cookie('JWT', accessToken, {
    maxAge: 3600000,
    httpOnly: true,
  });
  res.json('註冊成功');
};

// export const updatePreferenceAndOmit= async(req,res)=>{
//   const {}
// }

export const getProfileData = async (req, res) => {
  const accessToken = req.cookies.JWT;
  const decoded = jwt.verify(accessToken, process.env.MY_SECRET_KEY);
  const { id } = decoded;
  const userData = await User.findById(id);
  const userFridge = await Fridge.find({ members: id });

  res.send({ userFridge, userData });
};
