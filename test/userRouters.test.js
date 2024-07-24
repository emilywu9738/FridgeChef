import express from 'express';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import cookieParser from 'cookie-parser';
import userRouters from '../routers/userRouters.js';
import User from '../models/userModel.js';
import Recipe from '../models/recipeModel.js';
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

vi.mock('../models/userModel.js');
vi.mock('../models/recipeModel.js');
vi.mock('../models/invitationModel.js');
vi.mock('../models/fridgeModel.js');
vi.mock('../models/notificationModel.js');
vi.mock('../utils/socket.js', () => {
  const emit = vi.fn();
  return {
    getOnlineUsers: vi.fn(),
    io: {
      to: vi.fn(() => ({ emit })),
    },
  };
});

describe('GET user/likedRecipe', () => {
  let request;
  let token;

  beforeEach(() => {
    request = supertest(app);
    token = generateJWT('111');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return user data when user exists', async () => {
    const mockRecipes = [
      { _id: '1', title: 'Recipe 1', coverImage: 'image1.jpg', tags: ['tag1'] },
      { _id: '2', title: 'Recipe 2', coverImage: 'image2.jpg', tags: ['tag2'] },
    ];
    const mockUser = {
      _id: '111',
      liked_recipes: mockRecipes,
    };

    const findByIdMock = vi.spyOn(User, 'findById').mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockUser),
    });

    const response = await request
      .get('/user/likedRecipes')
      .set('Cookie', `JWT=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(findByIdMock).toHaveBeenCalledWith('111');
  });

  it('should return 401 when user has no accessToken', async () => {
    const response = await request.get('/user/likedRecipes');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Access Denied' });
  });

  it('should return 403 when user has wrong accessToken', async () => {
    const response = await request
      .get('/user/likedRecipes')
      .set('Cookie', 'JWT=wrongToken');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Authentication failed!' });
  });

  it('should return 500 when database query fails', async () => {
    const findByIdMock = vi.spyOn(User, 'findById').mockReturnValue({
      populate: vi.fn().mockRejectedValue(new Error('DB error')),
    });

    const response = await request
      .get('/user/likedRecipes')
      .set('Cookie', `JWT=${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'DB error' });
    expect(findByIdMock).toHaveBeenCalledWith('111');
  });
});

describe('PUT user/updateLikes', () => {
  let request;
  let userId;
  let token;

  beforeEach(() => {
    request = supertest(app);
    userId = '111';
    token = generateJWT('111');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should add recipe to liked_recipes and increment likes', async () => {
    const recipeId = '1';
    const liked = true;

    const userUpdateMock = vi
      .spyOn(User, 'findOneAndUpdate')
      .mockResolvedValue({});

    const recipeUpdateMock = vi
      .spyOn(Recipe, 'findOneAndUpdate')
      .mockResolvedValue({});

    const response = await request
      .put('/user/updateLikes')
      .set('Cookie', `JWT=${token}`)
      .send({ recipeId, liked });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: '資料已更新' });
    expect(userUpdateMock).toHaveBeenCalledWith(
      { _id: userId },
      { $push: { liked_recipes: recipeId } },
    );
    expect(recipeUpdateMock).toHaveBeenCalledWith(
      { _id: recipeId },
      { $inc: { likes: 1 } },
    );
  });

  it('should return 401 when user has no accessToken', async () => {
    const response = await request.put('/user/updateLikes');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Access Denied' });
  });

  it('should return 403 when user has wrong accessToken', async () => {
    const response = await request
      .put('/user/updateLikes')
      .set('Cookie', 'JWT=wrongToken');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Authentication failed!' });
  });

  it('should return 500 when user has wrong accessToken', async () => {
    const recipeId = '1';
    const liked = true;

    const userUpdateMock = vi
      .spyOn(User, 'findOneAndUpdate')
      .mockResolvedValue({});

    const recipeUpdateMock = vi
      .spyOn(Recipe, 'findOneAndUpdate')
      .mockResolvedValue({});

    const response = await request
      .put('/user/updateLikes')
      .set('Cookie', `JWT=${token}`)
      .send({ recipeId, liked });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: '資料已更新' });
    expect(userUpdateMock).toHaveBeenCalledWith(
      { _id: userId },
      { $push: { liked_recipes: recipeId } },
    );
    expect(recipeUpdateMock).toHaveBeenCalledWith(
      { _id: recipeId },
      { $inc: { likes: 1 } },
    );
  });
});

describe('PUT user/profile', () => {
  let request;
  let userId;
  let token;

  beforeEach(() => {
    request = supertest(app);
    userId = '111';
    token = generateJWT(userId);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should update preference and omit successfully', async () => {
    const mockUser = {
      _id: userId,
      preferences: 'oldPreference',
      omit: ['oldOmits'],
    };
    User.findOneAndUpdate.mockResolvedValue(mockUser);

    const response = await request
      .put('/user/profile')
      .set('Cookie', `JWT=${token}`)
      .send({ preferCategory: 'newPreference', previewList: ['newPreview'] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: '喜好已成功更新！' });
  });

  it('should return 400 if preferCategory or previewList is missing', async () => {
    const response = await request
      .put('/user/profile')
      .set('Cookie', `JWT=${token}`)
      .send({ preferCategory: 'newCategory' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: '請提供完整的喜好和預覽列表' });

    const response2 = await request
      .put('/user/profile')
      .set('Cookie', `JWT=${token}`)
      .send({ previewList: ['newPreview'] });

    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({ error: '請提供完整的喜好和預覽列表' });
  });

  it('should return 404 if user is not found', async () => {
    User.findOneAndUpdate.mockResolvedValue(null);

    const response = await request
      .put('/user/profile')
      .set('Cookie', `JWT=${token}`)
      .send({ preferCategory: 'newPreference', previewList: ['newPreview'] });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: '找不到此用戶' });
  });
});
