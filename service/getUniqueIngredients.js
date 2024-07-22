import fs from 'fs-extra';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 原始 JSON 檔案
const ORIGINAL_DATA_FILE = path.join(__dirname, 'recipeData.json');
// 新的去重後的 JSON 檔案
const NEW_DATA_FILE = path.join(__dirname, 'uniqueIngredients.json');

async function removeDuplicates() {
  try {
    // 讀取原始 JSON 檔案
    const rawData = await fs.readJson(ORIGINAL_DATA_FILE);

    // 使用 Set 來去重食材
    const uniqueIngredients = new Set();
    rawData.forEach((recipe) => {
      if (recipe.ingredients) {
        recipe.ingredients.forEach((ingredient) => {
          uniqueIngredients.add(ingredient); // 添加食材到 Set
        });
      }
    });

    // 將 Set 轉回 Array
    const uniqueIngredientsArray = Array.from(uniqueIngredients);

    // 將去重後的食材寫成新的檔案
    await fs.outputJson(NEW_DATA_FILE, uniqueIngredientsArray, { spaces: 2 });
    console.log('Duplicates removed and unique ingredients saved to new file');
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

// 執行去重函式
removeDuplicates();
