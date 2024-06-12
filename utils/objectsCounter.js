const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'recipeData.json');

async function countObjects() {
  try {
    const data = await fs.readJson(DATA_FILE);
    console.log(`The number of objects in the JSON file is: ${data.length}`);
  } catch (error) {
    console.error('Error reading the JSON file:', error);
  }
}

countObjects();
