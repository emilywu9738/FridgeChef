import mongoose from 'mongoose';

const { Schema } = mongoose;

const invitationSchema = new Schema({
  email: { type: String, required: true },
  groupId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '24h' },
});

export default mongoose.model('Invitation', invitationSchema);
