import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import neo4j from 'neo4j-driver';
import 'dotenv/config';
import Fridge from '../models/fridge.js';
import User from '../models/user.js';
import Recipe from '../models/recipe.js';
import ExpressError from '../utils/ExpressError.js';

const uri = 'bolt://localhost:7687';
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

// eslint-disable-next-line import/prefer-default-export
export const createIngredients = async (req, res) => {
  try {
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
        const fridge = await Fridge.findById('666bff0a147905139a1b6308');

        const categoryExists = fridge.ingredients.some(
          (ing) => ing.category === category,
        );
        if (categoryExists) {
          await Fridge.findOneAndUpdate(
            {
              _id: '666bff0a147905139a1b6308',
              'ingredients.category': category,
            },
            { $push: { 'ingredients.$.items': { $each: items } } },
            { new: true },
          );
        } else {
          await Fridge.findOneAndUpdate(
            { _id: '666bff0a147905139a1b6308' },
            { $push: { ingredients: { category, items } } },
            { new: true },
          );
        }
      }),
    );
    const message = formatFridgeContents(formattedItems);

    sendEmail(
      process.env.GMAIL_RECEIVER_TEST,
      'FridgeChef - 食材庫更新',
      `新食材已更新至食材庫。\n食材列表：\n${message}`,
    );

    res.status(200).send('食材已成功新增');
  } catch (err) {
    res.status(500).send('食材新增失敗');
    console.error(err);
  }
};

export const renderFridgeById = async (req, res) => {
  const userId = req.user.id;

  const { id } = req.query;
  const foundFridge = await Fridge.findById(id).populate({
    path: 'members',
    select: 'name preference omit',
  });

  const isMember = foundFridge.members.some(
    (member) => member._id.toString() === userId,
  );

  if (!isMember) {
    throw new ExpressError('Authentication failed!', 403);
  }

  res.send(foundFridge);
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
