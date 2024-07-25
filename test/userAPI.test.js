import express from 'express';
import supertest from 'supertest';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import User from '../models/userModel.js';

import {
  closeDB,
  connectDB,
  setupTestDatabase,
  teardownTestDatabase,
} from './setup.js';
import userRouters from '../routers/userRouters.js';
import generateJWT from '../utils/generateJWT.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/user', userRouters);

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).json({ error: err.message });
  console.error(err);
});

describe('Profile API Integration Tests', () => {
  let request;

  beforeAll(async () => {
    await connectDB();
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
    await closeDB();
  });

  beforeEach(async () => {
    request = supertest(app);
  });

  it('should return user profile data', async () => {
    const user = await User.findOne({ name: 'Thalia' });
    const userId = user._id.toString();
    const token = generateJWT(userId);

    const response = await request
      .get('/user/profile')
      .set('Cookie', `JWT=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(
      {
        userData: {
          _id: userId,
          name: 'Thalia',
          email: 'Thalia1116145@yahoo.com',
          liked_recipes: [],
          omit: [],
          password:
            '$2b$12$7CCph7IvpZ6VxbD0Q2ZTWeSKIItJnL3kAbCGB4M.yUu9Osft00Nfy',
          preference: '無',
          provider: 'native',
          receiveNotifications: true,
        },
      },
      { userFridge: [] },
    );
  });

  it('should return 404 when user does not exist', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
    const token = generateJWT(nonExistentUserId.toString());

    const response = await request
      .get('/user/profile')
      .set('Cookie', `JWT=${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: '未找到用戶',
    });
  });

  it('should update user data', async () => {
    const user = await User.findOne({ name: 'Thalia' });
    const token = generateJWT(user._id.toString());
    const updatedData = { preferCategory: '奶蛋素', previewList: ['苦瓜'] };

    const response = await request
      .put('/user/profile')
      .set('Cookie', `JWT=${token}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: '喜好已成功更新！',
    });
  });

  it('should return 400 when updatedData not provided', async () => {
    const foundUser = await User.findOne({ name: 'Thalia' });
    const token = generateJWT(foundUser._id.toString());

    const response = await request
      .put('/user/profile')
      .set('Cookie', `JWT=${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: '請提供完整的喜好和預覽列表',
    });
  });

  it('should return 404 when user does not exist', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
    const token = generateJWT(nonExistentUserId.toString());
    const updatedData = { preferCategory: '奶蛋素', previewList: ['苦瓜'] };

    const response = await request
      .put('/user/profile')
      .set('Cookie', `JWT=${token}`)
      .send(updatedData);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: '找不到此用戶',
    });
  });
});
