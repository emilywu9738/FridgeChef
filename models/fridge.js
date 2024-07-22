import mongoose from 'mongoose';

const { Schema } = mongoose;

const fridgeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  inviting: [{ type: Schema.Types.ObjectId, ref: 'Invitation' }],
  ingredients: [
    {
      category: { type: String, required: true },
      items: [
        {
          name: { type: String, required: true },
          expirationDate: { type: Date, required: true },
        },
      ],
    },
  ],
});

export default mongoose.model('Fridge', fridgeSchema);
