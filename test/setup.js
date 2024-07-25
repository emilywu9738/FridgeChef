import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/userModel.js';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGOOSE_CONNECT);
};

export const closeDB = async () => {
  await mongoose.disconnect();
};

export const teardownTestDatabase = async () => {
  const { collections } = mongoose.connection;
  const keys = Object.keys(collections);

  await Promise.all(
    keys.map(async (key) => {
      const collection = collections[key];
      await collection.deleteMany();
    }),
  );
};

export const setupTestDatabase = async () => {
  await User.create({
    provider: 'native',
    name: 'Thalia',
    email: 'Thalia1116145@yahoo.com',
    password: '$2b$12$7CCph7IvpZ6VxbD0Q2ZTWeSKIItJnL3kAbCGB4M.yUu9Osft00Nfy',
    preference: '無',
    receiveNotifications: true,
  });
};
