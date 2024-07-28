import fs from 'fs-extra';
import path, { dirname } from 'path';
import 'dotenv/config';
import { createWorker } from 'tesseract.js';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import Fridge from '../models/fridgeModel.js';
import User from '../models/userModel.js';
import Recipe from '../models/recipeModel.js';
import Notification from '../models/notificationModel.js';
import Invitation from '../models/invitationModel.js';
import ExpressError from '../utils/ExpressError.js';
import { getOnlineUsers, io } from '../utils/socket.js';
import sendEmail from '../utils/sendEmail.js';
import {
  recommendedRecipe,
  recommendedRecipeOnDetailPage,
} from '../models/cypherQuery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const synonymMap = [
  ['番茄', '蕃茄'],
  ['洋芋', '馬鈴薯'],
];

const getSynonyms = (ingredient) => {
  const synonymGroup = synonymMap.find((group) => group.includes(ingredient));
  return synonymGroup ? Array.from(synonymGroup) : [ingredient];
};

const generateRegexFromSynonyms = (ingredientNames) => {
  const regexParts = ingredientNames.flatMap((ingredient) => {
    const synonyms = getSynonyms(ingredient);
    return synonyms.map((synonym) => `(?i).*${synonym}.*`);
  });
  return `(${regexParts.join('|')})`;
};

function filterItemsExpiringWithinDays(items) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date();

  dueDate.setDate(dueDate.getDate() + 4);
  dueDate.setHours(0, 0, 0, 1);

  return items.filter((item) => {
    const expirationDate = new Date(item.expirationDate);

    return expirationDate <= dueDate;
  });
}

export const recommendRecipe = async (req, res) => {
  const { recipeCategory, fridgeData, membersCheckStatus } = req.body;

  const checkedIds = Object.keys(membersCheckStatus).filter(
    (key) => membersCheckStatus[key] === true,
  );

  const checkedUsers = await User.find({ _id: { $in: checkedIds } });

  const allOmitIngredients = Array.from(
    checkedUsers
      .flatMap((user) => user.omit)
      .flatMap((omit) => getSynonyms(omit))
      .reduce((set, synonym) => set.add(synonym), new Set()),
  );

  const fridgeItemNames = fridgeData.ingredients
    .flatMap((c) => c.items)
    .map((item) => item.name.trim());

  if (fridgeItemNames.length === 0) {
    throw new ExpressError('冰箱無食材，無法推薦食譜', 404);
  }

  const fridgeRegex = generateRegexFromSynonyms(fridgeItemNames);

  const expiringIngredientNames = filterItemsExpiringWithinDays(
    fridgeItemNames,
    3,
  ).map((item) => item.name);

  const omitRegex = generateRegexFromSynonyms(allOmitIngredients);

  let additionalQuery = '';
  if (recipeCategory === '全素' || recipeCategory === '奶蛋素') {
    additionalQuery = 'AND ANY(tag IN r.tags WHERE tag = $recipeCategory)';
  }

  try {
    const recipes = await recommendedRecipe(
      additionalQuery,
      fridgeRegex,
      omitRegex,
      recipeCategory,
      expiringIngredientNames,
      fridgeItemNames,
    );

    res.status(200).json({ recipes });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error recommending recipes:', error);
    throw new ExpressError('食譜推薦錯誤', 500);
  }
};

export const recommendRecipeOnDetailPage = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ExpressError('Page Not Found', 404);
  }

  try {
    // NEO4J計算後取得食譜id，再到MongoDB搜尋詳細資料
    const recommendedRecipes = await recommendedRecipeOnDetailPage(id);

    const recipeIds = recommendedRecipes.map((r) => r.recipe.id);
    const fullRecipes = await Recipe.find({
      _id: { $in: recipeIds },
    });

    res.status(200).json(fullRecipes);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error recommending recipes:', error);
    throw new ExpressError('食譜推薦錯誤', 500);
  }
};

function formatFridgeContents(contents) {
  return contents
    .map((category) => {
      const itemsString = category.items
        .map(
          (item) =>
            `${item.name} (有效期限: ${item.expirationDate
              .toISOString()
              .slice(0, 10)})`,
        )
        .join(', ');
      return `${category.category}：${itemsString}`;
    })
    .join('\n');
}

export const createIngredients = async (req, res) => {
  const onlineUsers = getOnlineUsers();
  const userId = req.user.id;
  const { fridgeId } = req.query;

  const createUser = await User.findById(userId);

  const fridge = await Fridge.findById(fridgeId).populate({
    path: 'members',
    select: 'email receiveNotifications',
  });

  const ingredients = req.body;
  const categorizedItems = ingredients.reduce((acc, item) => {
    const { category, name, expired } = item;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ name, expirationDate: new Date(expired) });
    return acc;
  }, {});

  const formattedItems = Object.entries(categorizedItems).map(
    ([category, items]) => ({
      category,
      items,
    }),
  );

  await Promise.all(
    formattedItems.map(async (newItem) => {
      const { category, items } = newItem;

      const categoryExists = fridge.ingredients.some(
        (ing) => ing.category === category,
      );
      if (categoryExists) {
        await Fridge.findOneAndUpdate(
          {
            _id: fridgeId,
            'ingredients.category': category,
          },
          { $push: { 'ingredients.$.items': { $each: items } } },
          { new: true },
        );
      } else {
        await Fridge.findOneAndUpdate(
          { _id: fridgeId },
          { $push: { ingredients: { category, items } } },
          { new: true },
        );
      }
    }),
  );
  const message = formatFridgeContents(formattedItems);
  fridge.members.forEach((member) => {
    if (member.receiveNotifications) {
      sendEmail(
        member.email,
        '【FridgeChef】食材庫更新',
        `${createUser.name} 已新增食材至【 ${fridge.name} 】。\n食材列表：\n${message}`,
        false,
      );
    }
  });

  const notification = new Notification({
    type: 'create',
    target: { type: 'Fridge', id: fridgeId },
    content: `【 ${fridge.name} 】${createUser.name} 已新增食材。 食材列表： ${message}`,
  });

  await notification.save();

  const getUsersInGroup = (groupId) =>
    onlineUsers.filter((u) => u.groupId.includes(groupId));

  const groupUsers = getUsersInGroup(fridgeId);
  const groupUserSocketId = groupUsers.map((u) => u.socketId);

  groupUserSocketId.forEach((socketId) => {
    io.to(socketId).emit('notification', 'new notification!');
  });

  res.status(200).json({ message: '食材已成功新增' });
};

async function loadIngredients() {
  try {
    const filePath = path.join(__dirname, '../data/ingredients.json');
    const ingredients = await fs.readJson(filePath);
    return ingredients;
  } catch (error) {
    // eslint-disable-next-line no-console
    return console.error('Failed to load ingredients:', error);
  }
}

export const createByPhoto = async (req, res) => {
  if (!req.file) {
    throw new ExpressError('No image uploaded', 400);
  }

  const ingredients = await loadIngredients();

  const preprocessedImage = await sharp(req.file.buffer)
    .resize(800) // 調整尺寸至800
    .grayscale() // 轉換為灰階
    .sharpen() // 銳化圖片，提高邊緣對比
    .toBuffer();

  const worker = await createWorker('chi_tra');

  try {
    const result = await worker.recognize(preprocessedImage);
    await worker.terminate();

    const dataWithoutSpace = result.data.text.replace(/\s+/g, '');

    const matchIngredients = ingredients.filter((ingredient) =>
      dataWithoutSpace.toLowerCase().includes(ingredient.toLowerCase()),
    );

    res.status(200).json(matchIngredients); // 返回 OCR 處理結果
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('OCR error:', error);
    throw new ExpressError('Failed to process image', 500);
  }
};

export const renderFridgeById = async (req, res) => {
  const userId = req.user.id;

  const { id } = req.query;
  const foundFridge = await Fridge.findById(id).populate([
    {
      path: 'members',
      select: 'name preference omit',
    },
    { path: 'inviting', select: 'userName email' },
  ]);
  if (!foundFridge) {
    throw new ExpressError('找不到此冰箱', 404);
  }

  const isMember = foundFridge.members.some(
    (member) => member._id.toString() === userId,
  );

  if (!isMember) {
    throw new ExpressError('Authentication failed!', 403);
  }

  res.status(200).json(foundFridge);
};

export const deleteItems = async (req, res) => {
  const { id } = req.params;
  const ingredientIds = req.body.ids;

  const fridge = await Fridge.findOne({ _id: id });

  if (!fridge) {
    throw new ExpressError('冰箱不存在！', 404);
  }

  await Fridge.updateOne(
    { _id: id },
    {
      $pull: {
        'ingredients.$[].items': { _id: { $in: ingredientIds } },
      },
    },
  );

  await Fridge.updateOne(
    { _id: id },
    {
      $pull: {
        ingredients: { items: { $size: 0 } },
      },
    },
  );

  return res.status(200).json({ message: '食材已刪除！' });
};

export const searchUserForInvite = async (req, res) => {
  const { id, email } = req.query;

  const [user] = await User.find({ email });
  if (!user) {
    throw new ExpressError('使用者不存在，請先註冊', 404);
  }
  if (id) {
    const [result] = await Fridge.find({ _id: id }).populate({
      path: 'members',
      select: 'email',
    });
    const fridgeMembers = result.members;

    let includeMember = false;
    fridgeMembers.forEach((m) => {
      if (m.email === email) {
        includeMember = true;
      }
      return includeMember;
    });
    if (includeMember) {
      throw new ExpressError('使用者已存在此群組，不能重複加入', 409);
    }
    res.status(200).json({ name: user.name, email: user.email });
  } else {
    res.status(200).json({ id: user._id, name: user.name, email: user.email });
  }
};

export const inviteMember = async (req, res) => {
  const hostId = req.user.id;
  const { id, email } = req.query;
  const [invitedUser] = await User.find({ email });

  const invitedUserId = invitedUser._id;

  const [host] = await User.find({ _id: hostId });

  const onlineUsers = getOnlineUsers();

  const invitation = new Invitation({
    userName: invitedUser.name,
    email,
    groupId: id,
  });
  const invitationResult = await invitation.save();
  const invitationId = invitationResult._id.toString();

  const result = await Fridge.findOneAndUpdate(
    { _id: id },
    { $push: { inviting: invitationId } },
    { new: true },
  );

  await sendEmail(
    email,
    `【FridgeChef】 ${host.name} 邀請您一起加入${result.name}！`,
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
              <p>群組名稱：${result.name}</p>
              <a href='https://myfridgechef.com/user/invitation?id=${invitationId}&email=${email}' class="button">接受邀請</a>
              <p>（此連結將於24小時後過期）</p>
            </div>
          </body>
          </html>
          `,
    true,
  );

  const notification = new Notification({
    type: 'invitation',
    target: { type: 'User', id: invitedUserId.toString() },
    content: `${host.name} 已邀請您至【 ${result.name}  】，點擊此通知加入。 `,
    link: `/user/invitation?id=${invitationId}&email=${email}`,
  });

  await notification.save();
  const getUser = (userId) => onlineUsers.find((u) => u.userId === userId);

  const userId = invitedUserId.toString();

  const socketUser = getUser(userId);

  if (socketUser && socketUser.socketId) {
    const { socketId } = socketUser;
    io.to(socketId).emit('notification', 'new notification!');
  } else {
    // eslint-disable-next-line no-console
    console.log(`User with ID ${userId} is not online.`);
  }

  res.status(200).json({ message: '已送出邀請！' });
};
