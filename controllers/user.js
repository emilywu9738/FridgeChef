import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

import User from '../models/user.js';
import Fridge from '../models/fridge.js';
import ExpressError from '../utils/ExpressError.js';
import { generateJWT } from '../utils/JWT.js';

mongoose.connect(process.env.MONGOOSE_CONNECT);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

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

export const logout = (req, res) => {
  res.clearCookie('JWT');
  res.status(200).send('logout!');
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

export const updatePreferenceAndOmit = async (req, res) => {
  const { id } = req.user;
  const { preferCategory, previewList } = req.body;

  await User.findOneAndUpdate(
    { _id: id },
    { preference: preferCategory, omit: previewList },
  );
  res.status(200).send('喜好已成功更新！');
};

export const getProfileData = async (req, res) => {
  const { id } = req.user;
  const userData = await User.findById(id);
  const userFridge = await Fridge.find({ members: id }).populate({
    path: 'members',
    select: 'name preference omit',
  });

  res.send({ userFridge, userData });
};

export const searchUser = async (req, res) => {
  const { name } = req.query;
  const results = await User.find({
    $or: [
      { name: { $regex: name, $options: 'i' } },
      { email: { $regex: name, $options: 'i' } },
    ],
  });
  res.json(results);
};

export const createGroup = async (req, res) => {
  const { name, description, host, inviting } = req.body;
  const fridge = new Fridge({ name, description, members: host, inviting });
  await fridge.save();
  res.status(200).send('群組新增成功！');
};
