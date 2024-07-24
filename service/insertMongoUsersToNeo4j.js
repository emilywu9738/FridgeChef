import neo4j from 'neo4j-driver';
import 'dotenv/config';
import Recipe from '../models/recipeModel.js';

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

async function clearAll() {
  try {
    const query = 'MATCH (n) DETACH DELETE n';
    await session.run(query);
    console.log('All data cleared!');
  } catch (err) {
    console.error('Error clearing all data:', err);
  }
}

async function insertAllRecipes(recipes) {
  try {
    const query = `
    UNWIND $params AS param
    CREATE (recipe:Recipe { id: param.id, name: param.title, tags: param.tags, ingredients: param.ingredients})
  `;

    const allParams = recipes.map((r) => {
      const { _id, title, tags, ingredients } = r;
      return { id: _id.toString(), title, tags, ingredients };
    });

    const params = { params: allParams };

    await session.run(query, params);
    console.log('Recipes created successfully!');
  } catch (err) {
    console.error('Error inserting recipes:', err);
  }
}

//  抓食譜內資訊直接新增ingredients並建立連結
async function createIngredientNodesAndRelationShips() {
  try {
    await session.run(
      `MATCH (r:Recipe)
         UNWIND r.ingredients AS ingredientName
         MERGE (i:Ingredient {name: ingredientName})
         MERGE (r)-[:CONTAINS]->(i)
         RETURN r.name AS recipeName, i.name AS ingredientName`,
    );

    console.log('Recipe ingredients and relationship created successfully');
  } catch (err) {
    console.error('Error creating ingredient node and relationships:', err);
  }
}

async function main() {
  try {
    const allRecipes = await Recipe.find();
    await clearAll();
    await insertAllRecipes(allRecipes);
    await createIngredientNodesAndRelationShips();
  } catch (err) {
    console.error('Error in main process:', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
