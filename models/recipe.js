const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  title: { type: String, required: true, unique: true },
  likes: Number,
  servings: String,
  ingredients: { type: [String], required: true },
  ingredients_detail: { type: [String], required: true },
  instructions: [
    {
      stepText: { type: String, required: true },
      stepImage: String,
    },
  ],
});

module.exports = mongoose.model('Recipe', recipeSchema);
