import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema({
  type: { type: String, required: true },
  target: {
    type: { type: String, required: true, enum: ['User', 'Fridge'] },
    id: { type: Schema.Types.ObjectId, required: true, refPath: 'target.type' },
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  readStatus: { type: Boolean, default: false },
});

export default mongoose.model('Notification', notificationSchema);
