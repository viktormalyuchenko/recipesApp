// netlify/functions/get-recipes.js
const Airtable = require('airtable');

exports.handler = async (event, context) => {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const records = await base('Recipes').select({
        //Можно настроить сортировку, фильтрацию и т.д.
        // sort: [{field: "id", direction: "asc"}],
        view: "Grid view" //Укажите название представления, если используете не "Grid view"
    }).all();

    const recipes = records.map(record => {
        //Преобразуем данные из формата Airtable в наш формат
        return {
            id: record.fields.id,
            title: record.fields.title,
            ingredients: record.fields.ingredients,
            instructions: record.fields.instructions,
            youtube: record.fields.youtube,
            //Важно:  Airtable возвращает массив объектов для attachments
            image: record.fields.image ? record.fields.image[0].url : null, //Берем URL первого изображения
            notes: record.fields.notes,
            description: record.fields.description
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