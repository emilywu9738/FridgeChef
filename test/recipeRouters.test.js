import express from 'express';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import cookieParser from 'cookie-parser';
import recipeRouters from '../routers/recipeRouters.js';
import Recipe from '../models/recipeModel.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/recipe', recipeRouters);

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).json({ error: err.message });
  console.error(err);
});

vi.mock('../models/recipeModel.js');

describe('GET /recipe/details', () => {
  let request;

  beforeEach(() => {
    request = supertest(app);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return recipe data when id is provided', async () => {
    const mockRecipe = {
      _id: 'recipeId',
      title: 'Test Recipe',
      ingredients: ['ingredient1', 'ingredient2'],
    };
    Recipe.findById.mockResolvedValue(mockRecipe);

    const response = await request
      .get('/recipe/details')
      .query({ id: 'recipeId' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRecipe);

    expect(Recipe.findById).toHaveBeenCalledWith('recipeId');
  });

  it('should return 404 if id is not provided', async () => {
    const response = await request.get('/recipe/details').query({});

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Page Not Found' });
  });
});

describe('GET /recipe/search', () => {
  let request;

  beforeEach(() => {
    request = supertest(app);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return recipes that contain the ingredient', async () => {
    const mockRecipes = [
      {
        _id: 'recipe1',
        title: 'Recipe 1',
        ingredients: ['ingredient1', 'ingredient2'],
      },
      {
        _id: 'recipe2',
        title: 'Recipe 2',
        ingredients: ['ingredient1', 'ingredient3'],
      },
    ];
    Recipe.find.mockResolvedValue(mockRecipes);

    const response = await request
      .get('/recipe/search')
      .query({ ingredient: 'ingredient1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRecipes);

    expect(Recipe.find).toHaveBeenCalledWith({ ingredients: 'ingredient1' });
  });

  it('should return an empty array if no recipes contain the ingredient', async () => {
    Recipe.find.mockResolvedValue([]);

    const response = await request
      .get('/recipe/search')
      .query({ ingredient: 'ingredientX' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    expect(Recipe.find).toHaveBeenCalledWith({ ingredients: 'ingredientX' });
  });
});
