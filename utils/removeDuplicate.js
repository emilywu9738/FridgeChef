import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 原始 JSON 檔案
const ORIGINAL_DATA_FILE = path.join(__dirname, 'rawData.json');
// 新的去重後的 JSON 檔案
const NEW_DATA_FILE = path.join(__dirname, 'recipeData.json');

async function removeDuplicates() {
  try {
    // 讀取原始 JSON 檔案
    const rawData = await fs.readJson(ORIGINAL_DATA_FILE);

    // 使用 Map 來去重
    const uniqueDataMap = new Map();
    rawData.forEach((item) => {
      uniqueDataMap.set(item.title, item); // 根據 title 去重
    });

    // 將 Map 轉回 Array
    const uniqueData = Array.from(uniqueDataMap.values());

    // 將去重後的資料寫成新的檔案
    await fs.outputJson(NEW_DATA_FILE, uniqueData);
    console.log('Duplicates removed and data saved to new file');
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

// 執行去重函式
removeDuplicates();
