import express from 'express';
import cookieParser from 'cookie-parser';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import fridgeRouters from '../routers/fridgeRouters.js';
import Fridge from '../models/fridgeModel.js';
import generateJWT from '../utils/generateJWT.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/fridge', fridgeRouters);

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).json({ error: err.message });
  console.error(err);
});

vi.mock('../models/fridgeModel.js');

describe('DELETE /fridge/:id/deleteItems', () => {
  let request;
  let userId;
  let token;

  beforeEach(() => {
    request = supertest(app);
    vi.clearAllMocks();
    userId = '111';
    token = generateJWT(userId);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should delete items from fridge and return success message', async () => {
    const mockFridge = {
      _id: 'fridgeId',
      ingredients: [
        {
          _id: 'ingredient1',
          items: [
            { _id: 'item1', name: 'Milk' },
            { _id: 'item2', name: 'Cheese' },
          ],
        },
        {
          _id: 'ingredient2',
          items: [{ _id: 'item3', name: 'Eggs' }],
        },
      ],
      save: vi.fn().mockResolvedValue(true),
    };

    Fridge.findOne.mockResolvedValue(mockFridge);

    const response = await request
      .delete('/fridge/fridgeId/deleteItems')
      .set('Cookie', `JWT=${token}`)
      .send({ ids: ['item1', 'item3'] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: '食材已刪除！' });

    expect(mockFridge.ingredients[0].items).toHaveLength(1);
    expect(mockFridge.ingredients[0].items[0]._id).toBe('item2');
    expect(mockFridge.ingredients[1].items).toHaveLength(0);

    expect(Fridge.findOne).toHaveBeenCalledWith({ _id: 'fridgeId' });
    expect(mockFridge.save).toHaveBeenCalled();
  });

  it('should return 404 if fridge does not exist', async () => {
    Fridge.findOne.mockResolvedValue(null);

    const response = await request
      .delete('/fridge/nonExistentFridgeId/deleteItems')
      .set('Cookie', `JWT=${token}`)
      .send({ ids: ['item1', 'item3'] });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: '冰箱不存在！' });

    expect(Fridge.findOne).toHaveBeenCalledWith({ _id: 'nonExistentFridgeId' });
  });
});
