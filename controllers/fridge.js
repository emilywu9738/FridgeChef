import mongoose from 'mongoose';
import Fridge from '../models/fridge.js';
import User from '../models/user.js';

mongoose.connect('mongodb://127.0.0.1:27017/fridgeChef');

// eslint-disable-next-line import/prefer-default-export
export const createIngredients = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).send('食材新增失敗');
    console.error(err);
  }
};

export const renderFridgeById = async (req, res) => {
  const { id } = req.query;
  const foundFridge = await Fridge.findById(id).populate({
    path: 'members',
    select: 'name preference omit',
  });
  res.send(foundFridge);
};

export const recommendRecipe = (req, res) => {
  const { fridgeData, checkedMembers } = req.body;

  const trueIds = Object.keys(checkedMembers).filter(
    (key) => checkedMembers[key] === true,
  );
  console.log(trueIds);

  res.send('clicked!');
};
