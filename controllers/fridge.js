import mongoose from 'mongoose';
import Fridge from '../models/fridge.js'; // 確保你正確引入 Fridge 模型

mongoose.connect('mongodb://127.0.0.1:27017/fridgeChef');

// eslint-disable-next-line import/prefer-default-export
export const createIngredients = async (req, res) => {
  const ingredients = req.body;
  const categorizedItems = ingredients.reduce((acc, item) => {
    const { category, name, expired } = item;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ name, expirationDate: new Date(expired) });
    return acc;
  }, {});

  const formattedItems = Object.entries(categorizedItems).map(
    ([category, items]) => ({
      category,
      items,
    }),
  );

  await Promise.all(
    formattedItems.map(async (newItem) => {
      const { category, items } = newItem;
      const fridge = await Fridge.findById('666bff0a147905139a1b6308');

      const categoryExists = fridge.ingredients.some(
        (ing) => ing.category === category,
      );
      if (categoryExists) {
        await Fridge.findOneAndUpdate(
          {
            _id: '666bff0a147905139a1b6308',
            'ingredients.category': category,
          },
          { $push: { 'ingredients.$.items': { $each: items } } },
          { new: true },
        );
      } else {
        await Fridge.findOneAndUpdate(
          { _id: '666bff0a147905139a1b6308' },
          { $push: { ingredients: { category, items } } },
          { new: true },
        );
      }
    }),
  );
  res.status(200).send('食材已成功新增');
};
