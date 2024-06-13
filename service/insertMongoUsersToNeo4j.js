import mongoose from 'mongoose';
import neo4j from 'neo4j-driver';
import 'dotenv/config';
import Recipe from '../models/recipe.js';
import User from '../models/user.js';

const uri = 'bolt://localhost:7687';
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

mongoose.connect('mongodb://127.0.0.1:27017/fridgeChef');
const db = mongoose.connection;
// eslint-disable-next-line no-console
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // eslint-disable-next-line no-console
  console.log('Database connected');
});

function getRecipes(allUsers) {
  const recipeSet = new Set();
  for (let i = 0; i < allUsers.length; i++) {
    const likedRecipes = allUsers[i].liked_recipes;
    likedRecipes.forEach((recipe) => {
      recipeSet.add(recipe);
    });
  }
  return Array.from(recipeSet);
}

async function insertAllRecipes(users) {
  const allRecipes = getRecipes(users);

  const query = `
        UNWIND $params AS param
        CREATE (recipe:Recipe { name: param.title, tags: param.tags, ingredients: param.ingredients})
      `;

  const allParams = allRecipes.map((r) => {
    const { title, tags, ingredients } = r;
    return { title, tags, ingredients };
  });

  const params = { params: allParams };

  await session.run(query, params);
  console.log('Recipes created successfully!');
}

async function insertAllUsers(users) {
  const query = `
        UNWIND $params AS param
        CREATE (user:User { name: param.name, email: param.email, preference: param.preference, omit: param.omit})
      `;

  const allParams = users.map((u) => {
    const { name, email, preference, omit } = u;
    return { name, email, preference, omit };
  });

  const params = { params: allParams };

  await session.run(query, params);
  console.log('Recipes created successfully!');
}

const allUsers = await User.find().populate({
  path: 'liked_recipes',
  select: 'title tags ingredients',
});

// await insertAllRecipes(allUsers);
await insertAllUsers(allUsers);
