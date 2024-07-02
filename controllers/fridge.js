import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import neo4j from 'neo4j-driver';
import fs from 'fs-extra';
import path from 'path';
import 'dotenv/config';
import { createWorker } from 'tesseract.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import Fridge from '../models/fridge.js';
import User from '../models/user.js';
import Recipe from '../models/recipe.js';
import Notification from '../models/notification.js';
import ExpressError from '../utils/ExpressError.js';
import { io, getOnlineUsers } from '../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uri = 'neo4j+s://aa84db4b.databases.neo4j.io:7687';
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

mongoose.connect(process.env.MONGOOSE_CONNECT);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// 定義同義詞字典
const synonymMap = {
  蕃茄: '番茄',
};

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

const standardizeIngredientName = (name) => {
  for (const [key, value] of Object.entries(synonymMap)) {
    if (value === name) {
      return key;
    }
  }
  return synonymMap[name] || name;
};

const getAllSynonyms = (ingredient) => {
  const synonyms = new Set();
  const standardName = standardizeIngredientName(ingredient);
  synonyms.add(standardName);
  for (const [key, value] of Object.entries(synonymMap)) {
    if (value === standardName) {
      synonyms.add(key);
    }
  }
  return Array.from(synonyms);
};

const generateRegexFromSynonyms = (omitIngredients) => {
  const regexParts = omitIngredients.flatMap((ingredient) => {
    const synonyms = getAllSynonyms(ingredient);
    return synonyms.map((synonym) => `(?i).*${synonym}.*`);
  });
  return `(${regexParts.join('|')})`;
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
    select: 'email',
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
    sendEmail(
      member.email,
      '【FridgeChef】食材庫更新',
      `${createUser.name} 更新食材至食材庫。\n食材列表：\n${message}`,
    );
  });

  const notification = new Notification({
    type: 'create',
    target: { type: 'Fridge', id: fridgeId },
    content: `${createUser.name} 已更新食材至 ${fridge.name}。 食材列表： ${message}`,
  });

  await notification.save();

  const getUsersInGroup = (groupId) =>
    onlineUsers.filter((u) => u.groupId.includes(groupId));

  const groupUsers = getUsersInGroup(fridgeId);
  const groupUserSocketId = groupUsers.map((u) => u.socketId);

  groupUserSocketId.forEach((socketId) => {
    io.to(socketId).emit('notification', 'new notification!');
  });

  res.status(200).send('食材已成功新增');
};

async function loadIngredients() {
  try {
    const filePath = path.join(__dirname, '../data/ingredients.json');
    const ingredients = await fs.readJson(filePath);
    return ingredients;
  } catch (error) {
    return console.error('Failed to load ingredients:', error);
  }
}

export const createByPhoto = async (req, res) => {
  if (!req.file) {
    throw new ExpressError('No image uploaded', 400);
  }

  const ingredients = await loadIngredients();

  const worker = await createWorker('chi_tra');

  try {
    const result = await worker.recognize(req.file.buffer);
    await worker.terminate();

    const dataWithoutSpace = result.data.text.replace(/\s+/g, '');

    const matchIngredients = ingredients.filter((ingredient) =>
      dataWithoutSpace.toLowerCase().includes(ingredient.toLowerCase()),
    );

    res.send(matchIngredients); // 返回 OCR 處理結果
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).send('Failed to process image');
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
    { path: 'inviting', select: 'name email' },
  ]);

  const isMember = foundFridge.members.some(
    (member) => member._id.toString() === userId,
  );

  if (!isMember) {
    throw new ExpressError('Authentication failed!', 403);
  }

  res.send(foundFridge);
};

export const renderRecipeById = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    throw new ExpressError('Page Not Found', 404);
  }
  const foundRecipe = await Recipe.findById(id);

  res.status(200).send(foundRecipe);
};

function filterItemsExpiringWithinDays(items, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3);
  dueDate.setHours(0, 0, 0, 1);

  return items.filter((item) => {
    const expirationDate = new Date(item.expirationDate);
    return expirationDate <= dueDate;
  });
}

export const recommendRecipe = async (req, res) => {
  const { recipeCategory, fridgeData, checkedMembers } = req.body;

  const trueIds = Object.keys(checkedMembers).filter(
    (key) => checkedMembers[key] === true,
  );
  const checkedUsersPromises = trueIds.map((id) => User.findById(id));
  const checkedUsers = await Promise.all(checkedUsersPromises);

  const omitIngredients = new Set();
  checkedUsers.forEach((u) => {
    u.omit.forEach((o) => {
      getAllSynonyms(o).forEach((synonym) => omitIngredients.add(synonym));
    });
  });
  const allOmitIngredients = Array.from(omitIngredients);
  const fridgeItems = fridgeData.ingredients.flatMap((c) => c.items);
  const fridgeItemNames = fridgeItems.map((item) => item.name);

  const filteredItems = filterItemsExpiringWithinDays(fridgeItems, 3);
  const expiringIngredientNames = filteredItems.map((item) => item.name);

  const omitRegex = generateRegexFromSynonyms(allOmitIngredients);
  const searchRegex = generateRegexFromSynonyms(expiringIngredientNames);

  let additionalQuery = '';
  if (recipeCategory === '全素' || recipeCategory === '奶蛋素') {
    additionalQuery = 'AND ANY(tag IN r.tags WHERE tag = $recipeCategory)';
  }

  const cypherQuery = `
    MATCH (r:Recipe)-[:CONTAINS]->(i:Ingredient)
    WHERE i.name =~ $searchRegex
      AND NOT EXISTS {
        MATCH (r)-[:CONTAINS]->(i2:Ingredient)
        WHERE i2.name =~ $omitRegex 
      }
    ${additionalQuery}
    WITH r, i,
      CASE 
        WHEN i.name IN $expiringIngredientNames THEN 1  // 快過期的食材得到更高的得分
        WHEN i.name IN $fridgeItemNames THEN 1  // 其他冰箱中的食材得到基本得分
        ELSE 0
      END AS ingredientScore
    WITH r, COLLECT(i.name) AS includedIngredients,
      SUM(ingredientScore) AS totalScore
    RETURN r, includedIngredients, totalScore
    ORDER BY totalScore DESC
    LIMIT 6
  `;

  try {
    const result = await session.run(cypherQuery, {
      searchRegex,
      omitRegex,
      recipeCategory,
      expiringIngredientNames,
      fridgeItemNames,
    });

    const recommendedRecipes = result.records.map(
      (record) => record.get('r').properties,
    );
    const recipeIds = recommendedRecipes.map((r) => r.id);
    const fullRecipes = await Recipe.find({
      _id: { $in: recipeIds },
    });

    res.json({ fullRecipes });
  } catch (error) {
    console.error('Error recommending recipes:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const recommendRecipeOnDetailPage = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ExpressError('Page Not Found', 404);
  }

  const query = `
        MATCH (currentRecipe:Recipe {id: $id})-[:CONTAINS]->(ingredient:Ingredient)
        WITH currentRecipe, collect(ingredient) AS currentIngredients
        MATCH (recommendedRecipe:Recipe)-[:CONTAINS]->(ingredient:Ingredient)
        WHERE currentRecipe <> recommendedRecipe
        WITH recommendedRecipe, currentIngredients, collect(ingredient) AS otherIngredients
        WITH recommendedRecipe, 
             size(apoc.coll.intersection(currentIngredients, otherIngredients)) AS intersection,
             size(apoc.coll.union(currentIngredients, otherIngredients)) AS union
        RETURN recommendedRecipe, intersection * 1.0 / union AS jaccardIndex
        ORDER BY jaccardIndex DESC
        LIMIT 5
    `;

  try {
    const result = await session.run(query, { id });
    const recommendedRecipes = result.records.map((record) => ({
      recipe: record.get('recommendedRecipe').properties,
      jaccardIndex: record.get('jaccardIndex'),
    }));
    const recipeIds = recommendedRecipes.map((r) => r.recipe.id);
    const fullRecipes = await Recipe.find({
      _id: { $in: recipeIds },
    });
    res.json(fullRecipes);
  } catch (error) {
    console.error('Error finding similar recipes:', error);
  }
};
