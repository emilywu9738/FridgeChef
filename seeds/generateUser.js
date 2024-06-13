import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import Recipe from '../models/recipe.js'; //
import User from '../models/user.js';

mongoose.connect('mongodb://127.0.0.1:27017/fridgeChef');

const category = ['無', '全素', '奶蛋素'];
const dislikedIngredients = [
  '香菜',
  '茄子',
  '芹菜',
  '番茄',
  '苦瓜',
  '秋葵',
  '芹菜',
  '青椒',
  '芋頭',
  '南瓜',
  '小黃瓜',
  '紅蘿蔔',
  '韭菜',
  '辣椒',
  '山藥',
];

function getPreference(num) {
  if (num === 1) {
    return category[1];
  }
  if (num === 2) {
    return category[2];
  }
  return category[0];
}

function getOmit(num) {
  const selectedIngredients = new Set();
  while (selectedIngredients.size < num) {
    const randomIndex = Math.floor(Math.random() * dislikedIngredients.length);
    selectedIngredients.add(dislikedIngredients[randomIndex]);
  }
  return Array.from(selectedIngredients);
}

async function getLikedRecipes() {
  const recipes = await Recipe.find();
  const recipeIds = recipes.map((recipe) => recipe._id);
  const likedRecipesNum = Math.floor(Math.random() * 130) + 20; // 20 到 130 之間的數字
  const likedRecipes = new Set();
  while (likedRecipes.size < likedRecipesNum) {
    const randomIndex = Math.floor(Math.random() * recipeIds.length);
    likedRecipes.add(recipeIds[randomIndex]);
  }
  return Array.from(likedRecipes);
}

async function generateUsers(userNum) {
  for (let i = 0; i < userNum; i++) {
    const randomName = faker.person.firstName();
    const randomEmail = faker.internet.email(randomName);
    const hashedPassword = await bcrypt.hash(process.env.USER_PASSWORD, 12);
    const randomNum = Math.floor(Math.random() * 5);
    const likedRecipes = await getLikedRecipes();
    const preference = getPreference(randomNum);
    const omit = getOmit(randomNum);

    const user = new User({
      name: randomName,
      email: randomEmail,
      password: hashedPassword,
      liked_recipes: likedRecipes,
      preference,
      omit,
    });

    await user.save();
  }
}

generateUsers(10).then(() => {
  mongoose.connection.close();
  console.log('New user added successfully!');
});
