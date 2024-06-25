import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

import User from '../models/user.js';
import Fridge from '../models/fridge.js';
import Notification from '../models/notification.js';
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
    const invitePromises = inviting.map(async (member) => {
      const invitation = new Invitation({
        email: member.email,
        groupId,
      });
      const invitationResult = await invitation.save();
      const invitationId = invitationResult._id.toString();

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
              <a href='http://localhost:5173/user/invitation?id=${invitationId}&email=${member.email}' class="button">接受邀請</a>
              <p>（此連結將於24小時後過期）</p>
            </div>
          </body>
          </html>
          `,
      );

      const notification = new Notification({
        type: 'invitation',
        target: { type: 'User', id: member._id.toString() },
        content: `${host.name} 已邀請您至 ${name}。 `,
      });

      await notification.save();
    });
    await Promise.all(invitePromises);
  }

  res.status(200).send('群組新增成功！');
};

export const validateInvitation = async (req, res) => {
  const { id, email } = req.query;

  const { user } = req;
  const foundUser = await User.findById(user.id);
  if (foundUser.email !== email) {
    throw new ExpressError('Authentication failed!', 403);
  }

  const invitation = await Invitation.findById(id);
  if (!invitation) {
    return res.status(404).send('邀請已過期或不存在');
  }

  const result = await Fridge.findOneAndUpdate(
    { _id: invitation.groupId },
    {
      $pull: { inviting: user.id },
      $addToSet: { members: user.id },
    },
  );

  const groupNotification = new Notification({
    type: 'invitation',
    target: { type: 'Fridge', id: invitation.groupId },
    content: `${foundUser.name} 已成功加入群組 ${result.name}`,
  });

  await groupNotification.save();

  return res.status(200).send('群組加入成功！');
};

export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  const userFridge = await Fridge.find({ members: userId });
  const userFridgeIds = userFridge.map((fridge) => fridge._id.toString());

  const notificationsFromDB = await Notification.find({
    $or: [
      { 'target.id': userId, 'target.type': 'User' },
      { 'target.id': { $in: userFridgeIds }, 'target.type': 'Fridge' },
    ],
  });

  function determineTopic(notificationType) {
    if (notificationType === 'create') {
      return '新增食材';
    }
    if (notificationType === 'expire') {
      return '過期通知';
    }
    return '群組邀請';
  }

  function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000; // 年份的秒數
    if (interval > 1) {
      return `${Math.floor(interval)} 年前`;
    }
    interval = seconds / 2592000; // 月份的秒數
    if (interval > 1) {
      return `${Math.floor(interval)} 月前`;
    }
    interval = seconds / 604800; // 周的秒數
    if (interval > 1) {
      return `${Math.floor(interval)} 周前`;
    }
    interval = seconds / 86400; // 天的秒數
    if (interval > 1) {
      return `${Math.floor(interval)} 天前`;
    }
    interval = seconds / 3600; // 小時的秒數
    if (interval > 1) {
      return `${Math.floor(interval)} 小時前`;
    }
    interval = seconds / 60; // 分鐘的秒數
    if (interval > 1) {
      return `${Math.floor(interval)} 分鐘前`;
    }
    return `${Math.floor(seconds)} 秒前`;
  }

  const sortedNotifications = notificationsFromDB.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const notifications = sortedNotifications.map((notify) => ({
    id: notify._id.toString(),
    topic: determineTopic(notify.type),
    content: notify.content,
    time: timeSince(notify.createdAt),
    readStatus: notify.readStatus,
  }));

  res.status(200).send(notifications);
};
