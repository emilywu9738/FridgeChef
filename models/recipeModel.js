import mongoose from 'mongoose';

const { Schema } = mongoose;

const recipeSchema = new Schema({
  title: { type: String, required: true, unique: true },
  coverImage: String,
  likes: Number,
  servings: String,
  tags: { type: [String], required: true },
  ingredients: { type: [String], required: true },
  ingredientsDetail: { type: [String], required: true },
  instructions: [
    {
      stepText: { type: String, required: true },
      stepImage: String,
    },
  ],
});

export default mongoose.model('Recipe', recipeSchema);
