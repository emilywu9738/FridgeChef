import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://icook.tw'; // 替換成你的網站基礎URL
const BREAKFAST_LIST_URL = `${BASE_URL}/categories/8`; // 替換成你的列表頁面URL
const DATA_FILE = path.join(__dirname, 'recipe.json');
const TOTAL_PAGES = 37;

let existingData = [];
try {
  existingData = fs.readJsonSync(DATA_FILE);
} catch (error) {
  console.error('Error reading existing data:', error);
}

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
}

function parseListPage(html) {
  const $ = cheerio.load(html);
  const links = [];

  $('a.browse-recipe-link').each((index, element) => {
    const title = $(element).find('h2').text().trim();
    const href = $(element).attr('href');
    if (href) {
      links.push({
        title,
        url: BASE_URL + href,
      });
    }
  });

  return links;
}

function parseRecipeDetail(html) {
  const $ = cheerio.load(html);
  const title = $('h1.title').text().trim(); // 替換成詳細頁面的標題選擇器
  let servings = '';
  const ingredients = [];
  const ingredientsDetail = [];
  const instructions = [];
  const tags = [];
  let coverImage = '';

  // 解析封面圖片
  coverImage = $('.recipe-cover img').attr('src');

  // 解析份量
  const num = $('.servings .num').text().trim();
  const unit = $('.servings .unit').text().trim();
  servings = `${num} ${unit}`;

  // 解析食材
  $('.ingredients .ingredient').each((index, element) => {
    const name = $(element).find('.ingredient-name a').text().trim();
    const unit = $(element).find('.ingredient-unit').text().trim();
    ingredients.push(`${name}`);
    ingredientsDetail.push(`${name} ${unit}`);
  });

  // 解析作法
  $('.recipe-details-step-item').each((index, element) => {
    const stepText = $(element)
      .find('.recipe-step-description p')
      .text()
      .trim()
      .replace(/\n/g, ' ');
    const stepImage = $(element).find('a').attr('href');
    instructions.push({
      stepText,
      stepImage,
    });
  });

  //解析tags
  $('.tags .tag').each((index, element) => {
    const tag = $(element).find('a').text().trim().replace('#', '');
    tags.push(tag);
  });

  const likes = Math.floor(Math.random() * 3000);

  return {
    title,
    coverImage,
    likes,
    servings,
    tags,
    ingredients,
    ingredientsDetail,
    instructions,
  };
}

async function crawlDetailPage(url) {
  const html = await fetchData(url);
  if (html) {
    return parseRecipeDetail(html);
  }
  return null;
}

async function crawlAllRecipes() {
  const allRecipes = [];

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const listUrl = `${BREAKFAST_LIST_URL}?page=${page}`;
    console.log(`Fetching list page: ${listUrl}`);
    const html = await fetchData(listUrl);
    if (!html) continue;

    const links = parseListPage(html);

    for (let link of links) {
      const recipe = await crawlDetailPage(link.url);
      if (recipe) {
        allRecipes.push(recipe);
      }
    }
  }

  // Combine new data with existing data
  const combinedData = existingData.concat(allRecipes);
  await fs.outputJson(DATA_FILE, combinedData);

  // await fs.outputJson(DATA_FILE, allRecipes);
  console.log('New data saved successfully');
}

// 執行爬蟲
(async () => {
  await crawlAllRecipes();
})();
