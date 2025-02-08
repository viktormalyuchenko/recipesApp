let recipes = [];

const recipeListDiv = document.getElementById("recipe-list");
const recipeDetailsDiv = document.getElementById("recipe-details");
const recipeTitle = document.getElementById("recipe-title");
const recipeIngredients = document.getElementById("recipe-ingredients");
const recipeInstructions = document.getElementById("recipe-instructions");
const recipeMedia = document.getElementById("recipe-media");
const recipeNotes = document.getElementById("recipe-notes");
const backButton = document.getElementById("back-button");

async function loadRecipes() {
    try {
        const response = await fetch('/.netlify/functions/get-recipes'); // Запрос к Netlify Function
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        recipes = await response.json();
        displayRecipeList();
    } catch (error) {
        console.error("Ошибка загрузки рецептов:", error);
        recipeListDiv.innerHTML = "<p>Не удалось загрузить рецепты. Попробуйте обновить страницу.</p>";
    }
}

function displayRecipeList() {
  recipeListDiv.innerHTML = ""; // Очищаем список
  recipes.forEach(recipe => {
    //Добавил проверку recipe.image
    const recipeItem = document.createElement("div");
    recipeItem.classList.add("recipe-item");
    recipeItem.innerHTML = `
        ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ''}
        <div class="recipe-item-content">
            <a href="#"><h2>${recipe.title}</h2></a>
            <p>${recipe.description || ""}</p>
            <button data-id="${recipe.id}">Подробнее</button>
        </div>
    `;
    recipeListDiv.appendChild(recipeItem);

    const detailButton = recipeItem.querySelector("button");
      detailButton.addEventListener("click", (event) => {
          event.preventDefault();
          showRecipeDetails(recipe.id);
          window.location.hash = `recipe-${recipe.id}`;
      });

  });
}
function showRecipeDetails(recipeId) {
  const recipe = recipes.find(r => r.id === parseInt(recipeId));

  if (!recipe) {
    console.error("Рецепт не найден:", recipeId);
    return;
  }

  recipeTitle.textContent = recipe.title;

  recipeIngredients.innerHTML = "<h2>Ингредиенты</h2>";
  const ingredientsList = document.createElement("ul");
  //Разбиваем строку на массив, если ingredients строка, а не массив
  const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : recipe.ingredients.split('\n');
    ingredientsArray.forEach(ingredient => {
      const listItem = document.createElement("li");
      listItem.textContent = ingredient;
      ingredientsList.appendChild(listItem);
  });
  recipeIngredients.appendChild(ingredientsList);

  recipeInstructions.innerHTML = "<h2>Приготовление</h2>";
    const instructionsList = document.createElement("ol");
  //Разбиваем строку на массив, если instructions строка, а не массив
  const instructionsArray = Array.isArray(recipe.instructions) ? recipe.instructions : recipe.instructions.split('\n');
    instructionsArray.forEach(step => {
        const listItem = document.createElement("li");
        listItem.textContent = step;
        instructionsList.appendChild(listItem);
    });
    recipeInstructions.appendChild(instructionsList);

  recipeMedia.innerHTML = "<h2>Фото и видео</h2>";
  if (recipe.image) { //Добавил проверку
      const image = document.createElement("img");
      image.src = recipe.image;
      image.alt = recipe.title;
      recipeMedia.appendChild(image);
  }

  if (recipe.youtube) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${recipe.youtube}`;
    iframe.allowFullscreen = true;
    recipeMedia.appendChild(iframe);
  }

  recipeNotes.innerHTML = "<h2>Заметки</h2>";
  const notesPara = document.createElement("p");
  notesPara.textContent = recipe.notes;
  recipeNotes.appendChild(notesPara);

  recipeListDiv.style.display = "none";
  recipeDetailsDiv.classList.add("active");
  window.scrollTo(0, 0);
}

backButton.addEventListener("click", () => {
  recipeDetailsDiv.classList.remove("active");
  recipeListDiv.style.display = "grid";
  window.location.hash = "";
  window.scrollTo(0, 0);
});

function handleHashChange() {
  const hash = window.location.hash;
  if (hash.startsWith("#recipe-")) {
    const recipeId = hash.substring(8);
    showRecipeDetails(recipeId);
  } else {
    recipeDetailsDiv.classList.remove("active");
    recipeListDiv.style.display = "grid";
  }
}

loadRecipes().then(() => {
  handleHashChange();
  window.addEventListener("hashchange", handleHashChange);
});