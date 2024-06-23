import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

import User from '../models/user.js';
import Fridge from '../models/fridge.js';
import Invitation from '../models/invitation.js';
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

const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const generateToken = () => crypto.randomBytes(16).toString('hex');

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
  const result = await fridge.save();
  const groupId = result._id.toString();

  if (Array.isArray(inviting) && inviting.length > 0) {
    const invitePromises = inviting.map((member) => {
      const token = generateToken();
      const invitation = new Invitation({
        email: member.email,
        token,
        groupId,
      });
      return invitation.save().then(() => {
        sendEmail(
          member.email,
          `【FridgeChef】 ${host.name} 邀請您一起加入${name}！`,
          `<!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            .email-container {
              width: 100%;
              max-width: 600px;
              margin-top: 10px;
              padding: 20px;
              border-radius: 8px;
              border:1px solid;
              text-align: center;
            }
            a.button {
              background-color: #ea8c55;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              display: inline-block;
            }
          </style>
          </head>
          <body>
            <div class="email-container">
              <h2>Invitation</h2>
              <p>您收到 ${host.name} (${host.email}) 的邀請，歡迎您一起加入 FridgeChef 群組！</p>
              <p>群組名稱：${name}</p>
              <a href='http://localhost:5173/user/invitation?token=${token}&email=${member.email}' class="button">接受邀請</a>
              <p>（此連結將於24小時後過期）</p>
            </div>
          </body>
          </html>
          `,
        );
      });
    });

    await Promise.all(invitePromises);
  }

  res.status(200).send('群組新增成功！');
};

export const validateInvitation = async (req, res) => {
  const { token, email } = req.query;
  const { user } = req;
  const foundUser = await User.findOne({ _id: user.id });
  if (foundUser.email !== email) {
    throw new ExpressError('Authentication failed!', 403);
  }

  const invitation = await Invitation.findOne({ token });
  if (!invitation) {
    return res.status(404).send('邀請已過期或不存在');
  }

  await Fridge.findOneAndUpdate(
    { _id: invitation.groupId },
    {
      $pull: { inviting: user.id },
      $addToSet: { members: user.id },
    },
  );

  res.status(200).send('群組加入成功！');
};
