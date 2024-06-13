import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  liked_recipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  preference: { type: String, required: true },
  omit: { type: [String] },
});

export default mongoose.model('User', userSchema);
