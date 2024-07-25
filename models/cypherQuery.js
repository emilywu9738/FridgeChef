import neo4j from 'neo4j-driver';
import 'dotenv/config';

import Recipe from './recipeModel.js';

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export const recommendedRecipe = async (
  additionalQuery,
  fridgeRegex,
  omitRegex,
  recipeCategory,
  expiringIngredientNames,
  fridgeItemNames,
) => {
  const session = driver.session();
  const cypherQuery = `
    MATCH (r:Recipe)-[:CONTAINS]->(i:Ingredient)
    WHERE (i.name =~ $fridgeRegex)
      AND NOT EXISTS {
        MATCH (r)-[:CONTAINS]->(i2:Ingredient)
        WHERE i2.name =~ $omitRegex 
      }
  ${additionalQuery}
    WITH r, i,
      CASE 
        WHEN i.name IN $expiringIngredientNames THEN 3  // 快過期的食材得到2分
        WHEN i.name IN $fridgeItemNames THEN 1  // 冰箱中的食材得到1分
        ELSE 0
      END AS ingredientScore
    WITH r, COLLECT(i.name) AS includedIngredients,
      SUM(ingredientScore) AS totalScore
    RETURN r, includedIngredients, totalScore
    ORDER BY totalScore DESC
    LIMIT 6
  `;

  const result = await session.run(cypherQuery, {
    fridgeRegex,
    omitRegex,
    recipeCategory,
    expiringIngredientNames,
    fridgeItemNames,
  });

  const recommendedRecipes = result.records.map((record) => {
    const recipe = record.get('r').properties;
    const includedIngredients = record.get('includedIngredients');
    const totalScore = record.get('totalScore').toInt();
    return { recipe, includedIngredients, totalScore };
  });

  const recipeIds = recommendedRecipes.map((r) => r.recipe.id);
  const fullRecipes = await Recipe.find({
    _id: { $in: recipeIds },
  });

  const recipesSortedByScores = fullRecipes
    .map((recipe) => {
      const found = recommendedRecipes.find((r) => r.recipe.id === recipe.id);
      return {
        ...recipe.toObject(),
        includedIngredients: found.includedIngredients,
        totalScore: found.totalScore,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return recipesSortedByScores;
};

export const recommendedRecipeOnDetailPage = async (id) => {
  const session = driver.session();
  const query = `
        // 取得當前食譜及其包含的所有成分
          MATCH (currentRecipe:Recipe {id: $id})-[:CONTAINS]->(ingredient:Ingredient)
          WITH currentRecipe, collect(ingredient) AS currentIngredients

        // 取得所有其他的食譜及其包含的成分，並且去掉當前食譜
          MATCH (recommendedRecipe:Recipe)-[:CONTAINS]->(ingredient:Ingredient)
          WHERE currentRecipe <> recommendedRecipe
            AND ingredient IN currentIngredients
          WITH recommendedRecipe, currentIngredients, collect(ingredient) AS otherIngredients

        // 計算當前食譜和推薦食譜之間的 Jaccard Index (計算方式：交集/聯集)
          WITH recommendedRecipe, 
               size(apoc.coll.intersection(currentIngredients, otherIngredients)) AS intersection,
               size(apoc.coll.union(currentIngredients, otherIngredients)) AS union
          RETURN recommendedRecipe, intersection * 1.0 / union AS jaccardIndex
          ORDER BY jaccardIndex DESC
          LIMIT 5
      `;

  const result = await session.run(query, { id });
  const recommendedRecipes = result.records.map((record) => ({
    recipe: record.get('recommendedRecipe').properties,
    jaccardIndex: record.get('jaccardIndex'),
  }));

  return recommendedRecipes;
};
