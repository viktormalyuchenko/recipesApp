// netlify/functions/get-recipes.js
const Airtable = require('airtable');

exports.handler = async (event, context) => {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const records = await base('Recipes').select({
      view: "Grid view" // Или ваше представление
    }).all();

    const recipes = records.map(record => {
      return {
        id: record.fields.id,
        title: record.fields.title,
        ingredients: record.fields.ingredients,
        instructions: record.fields.instructions,
        youtube: record.fields.youtube,
        image: record.fields.image ? record.fields.image[0].url : null,
        notes: record.fields.notes,
        description: record.fields.description,
        // Добавляем категории
        categories: record.fields.categories || [], // Если категорий нет, возвращаем пустой массив
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(recipes),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    };
  }
};