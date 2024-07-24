import Recipe from '../models/recipeModel.js';
import ExpressError from '../utils/ExpressError.js';

export const searchRecipes = async (req, res) => {
  const { ingredient } = req.query;

  const result = await Recipe.find({ ingredients: ingredient });
  res.status(200).json(result);
};

export const renderRecipeById = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    throw new ExpressError('Page Not Found', 404);
  }
  const foundRecipe = await Recipe.findById(id);

  res.status(200).json(foundRecipe);
};
