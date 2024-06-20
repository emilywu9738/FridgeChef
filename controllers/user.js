import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';

import User from '../models/user.js';
import ExpressError from '../utils/ExpressError.js';
import generateJWT from '../utils/generateJWT.js';

mongoose.connect(process.env.MONGOOSE_CONNECT);

export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  const foundUser = await User.find({ email });
  if (foundUser.length > 0) {
    throw new ExpressError('使用者已存在，請直接登入', 403);
  }

  const user = new User({ name, email, password: hashedPassword });

  const result = await user.save();
  const id = result._id.toString();
  const accessToken = generateJWT(id);
  res.cookie('JWT', accessToken, {
    maxAge: 3600000,
    httpOnly: true,
  });
  res.json(id);
};

// export const updatePreferenceAndOmit= async(req,res)=>{
//   const {}
// }
