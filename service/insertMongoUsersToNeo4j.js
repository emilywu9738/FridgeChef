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
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
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

const allUsers = await User.find().populate({
  path: 'liked_recipes',
  select: 'title tags ingredients',
});

async function insertAllRecipesToNeo4j(users) {
  const allRecipes = getRecipes(users);
  // console.log(Array.isArray(allRecipeNodes[0].title));

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
  console.log('Data created successfully!');
}

await insertAllRecipesToNeo4j(allUsers);
