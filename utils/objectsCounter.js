import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_FILE = path.join(__dirname, '../data', 'recipeData.json');

async function countObjects() {
  try {
    const data = await fs.readJson(DATA_FILE);
    console.log(`Number of objects: ${data.length}`);
  } catch (error) {
    console.error('Error reading the JSON file:', error);
  }
}

countObjects();
