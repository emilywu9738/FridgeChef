import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import Fridge from '../models/fridge.js';
import User from '../models/user.js';

mongoose.connect('mongodb://127.0.0.1:27017/fridgeChef');

async function getRandomUsers() {
  const allUsers = await User.find();
  const userIds = allUsers.map((user) => user._id);
  const userTotal = Math.floor(Math.random() * 4) + 1;
  const userGroup = new Set();
  while (userGroup.size < userTotal) {
    const randomIndex = Math.floor(Math.random() * userIds.length);
    userGroup.add(userIds[randomIndex]);
  }
  return Array.from(userGroup);
}

async function generateFridges() {
  const randomName = faker.person.firstName();
  const randomUsers = await getRandomUsers();

  const fridge = new Fridge({
    name: `${randomName}'s Home`,
    members: randomUsers,
  });

  await fridge.save();
  console.log('Fridge added successfully!');
}

await generateFridges();
