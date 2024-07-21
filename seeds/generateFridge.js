import mongoose from 'mongoose';
import 'dotenv/config';

import Fridge from '../models/fridge.js';
import User from '../models/user.js';

mongoose.connect(process.env.MONGOOSE_CONNECT);

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

async function generateFridges(fridgeNum) {
  for (let i = 0; i < fridgeNum; i++) {
    const randomUsers = await getRandomUsers();
    const [firstUser] = await User.find(randomUsers[0]);

    const fridge = new Fridge({
      name: `${firstUser.name}'s Home`,
      members: randomUsers,
    });

    await fridge.save();
  }
  console.log('Fridges added successfully!');
}

await generateFridges(5);
