import 'dotenv/config';
import bcrypt from 'bcrypt';
import { getOnlineUsers, io } from '../utils/socket.js';

import User from '../models/user.js';
import Fridge from '../models/fridge.js';
import Recipe from '../models/recipe.js';
import Notification from '../models/notification.js';
import Invitation from '../models/invitation.js';
import ExpressError from '../utils/ExpressError.js';
import generateJWT from '../utils/generateJWT.js';
import sendEmail from '../utils/sendEmail.js';

export const login = async (req, res) => {
  const { provider, email, password } = req.body;
  if (provider === 'native') {
    const [foundUser] = await User.find({ email });
    if (!foundUser) {
      throw new ExpressError('使用者不存在！將為您導到註冊頁面', 404);
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
      secure: true,
      sameSite: 'none',
    });

    res.status(200).json({ message: '登入成功' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('JWT');
  res.status(200).json({ message: 'logout!' });
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
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ message: '註冊成功' });
};

export const updatePreferenceAndOmit = async (req, res) => {
  const { id } = req.user;
  const { preferCategory, previewList } = req.body;

  if (!preferCategory || !previewList) {
    throw new ExpressError('請提供完整的喜好和預覽列表', 400);
  }

  const user = await User.findOneAndUpdate(
    { _id: id },
    { preference: preferCategory, omit: previewList },
  );

  if (!user) {
    throw new ExpressError('找不到此用戶', 404);
  }

  res.status(200).json({ message: '喜好已成功更新！' });
};

export const getProfileData = async (req, res) => {
  const { id } = req.user;
  const userData = await User.findById(id);
  if (!userData) {
    throw new ExpressError('未找到用戶', 404);
  }

  const userFridge = await Fridge.find({ members: id }).populate({
    path: 'members',
    select: 'name preference omit receiveNotifications',
  });

  res.status(200).json({ userFridge, userData });
};

export const getUserInfo = async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) {
    throw new ExpressError('未找到用戶', 404);
  }

  const userName = user.name;
  const userEmail = user.email;
  const userFridge = await Fridge.find({ members: id });

  const groupId = userFridge.map((fridge) => fridge._id.toString());

  res.status(200).json({ userId: id, groupId, userName, userEmail });
};

export const getLikedRecipes = async (req, res) => {
  const { id } = req.user;
  const likedRecipes = await User.findById(id).populate({
    path: 'liked_recipes',
    select: '_id title coverImage tags',
  });

  res.status(200).json(likedRecipes);
};

export const createGroup = async (req, res) => {
  const { name, description, host, inviting } = req.body;
  const invitingUserIds = inviting.map((user) => user.id);
  const fridge = new Fridge({
    name,
    description,
    members: host,
    inviting: invitingUserIds,
  });
  const result = await fridge.save();
  const groupId = result._id.toString();
  const onlineUsers = getOnlineUsers();

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
              <a href='https://myfridgechef.com/user/invitation?id=${invitationId}&email=${member.email}' class="button">接受邀請</a>
              <p>（此連結將於24小時後過期）</p>
            </div>
          </body>
          </html>
          `,
        true,
      );

      const notification = new Notification({
        type: 'invitation',
        target: { type: 'User', id: member.id },
        content: `${host.name} 已邀請您至【 ${name}  】，點擊此通知加入。 `,
        link: `/user/invitation?id=${invitationId}&email=${member.email}`,
      });

      await notification.save();
      const getUser = (userId) => onlineUsers.find((u) => u.userId === userId);

      const userId = member.id;

      const user = getUser(userId);

      if (user && user.socketId) {
        const { socketId } = user;
        io.to(socketId).emit('notification', 'new notification!');
      } else {
        console.log(`User with ID ${userId} is not online.`);
      }
    });
    await Promise.all(invitePromises);
  }

  res.status(200).json({ message: '群組新增成功！' });
};

export const validateInvitation = async (req, res) => {
  const onlineUsers = getOnlineUsers();
  const { id, email } = req.query;

  const { user } = req;
  const foundUser = await User.findById(user.id);
  if (foundUser.email !== email) {
    throw new ExpressError('Authentication failed!', 403);
  }

  const invitation = await Invitation.findById(id);
  if (!invitation) {
    throw new ExpressError('邀請已過期或不存在', 404);
  }

  const alreadyJoinedGroup = await Fridge.findOne({
    _id: invitation.groupId,
    members: user.id,
  });

  if (alreadyJoinedGroup) throw new ExpressError('已加入該群組', 400);

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
    content: `【 ${result.name} 】${foundUser.name} 已成功加入`,
  });

  await groupNotification.save();

  const getUsersInGroup = (groupId) =>
    onlineUsers.filter((u) => u.groupId.includes(groupId));

  const groupUsers = getUsersInGroup(invitation.groupId);
  const groupUserSocketId = groupUsers.map((u) => u.socketId);

  groupUserSocketId.forEach((socketId) => {
    io.to(socketId).emit('notification', 'new notification!');
  });

  return res.status(200).json({ message: '群組加入成功！' });
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
    return '冰箱通知';
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
    link: notify.link,
  }));

  await Notification.updateMany(
    {
      $or: [
        { 'target.id': userId, 'target.type': 'User' },
        { 'target.id': { $in: userFridgeIds }, 'target.type': 'Fridge' },
      ],
    },
    { $set: { readStatus: true } },
  );

  res.status(200).json({ notifications });
};

export const countNotifications = async (req, res) => {
  const userId = req.user.id;
  const userFridge = await Fridge.find({ members: userId });
  const userFridgeIds = userFridge.map((fridge) => fridge._id.toString());

  const count = await Notification.countDocuments({
    $or: [
      { 'target.id': userId, 'target.type': 'User' },
      { 'target.id': { $in: userFridgeIds }, 'target.type': 'Fridge' },
    ],
    readStatus: false,
  });

  res.status(200).json({ count });
};

export const updateLikes = async (req, res) => {
  const userId = req.user.id;
  const { recipeId, liked } = req.body;
  if (liked) {
    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { liked_recipes: recipeId } },
    );
    await Recipe.findOneAndUpdate({ _id: recipeId }, { $inc: { likes: 1 } });
  } else {
    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { liked_recipes: recipeId } },
    );
    await Recipe.findOneAndUpdate({ _id: recipeId }, { $inc: { likes: -1 } });
  }

  res.status(200).json({ message: '資料已更新' });
};

export const updateReceiveNotifications = async (req, res) => {
  const userId = req.user.id;
  const { checked } = req.body;
  if (checked) {
    await User.findOneAndUpdate(
      { _id: userId },
      { receiveNotifications: true },
    );
  } else {
    await User.findOneAndUpdate(
      { _id: userId },
      { receiveNotifications: false },
    );
  }

  res.status(200).json({ message: '通知設定已更新' });
};
