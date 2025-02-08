let recipes = [];

const recipeListDiv = document.getElementById("recipe-list");
const recipeDetailsDiv = document.getElementById("recipe-details");
const recipeTitle = document.getElementById("recipe-title");
const recipeIngredients = document.getElementById("recipe-ingredients");
const recipeInstructions = document.getElementById("recipe-instructions");
const recipeMedia = document.getElementById("recipe-media");
const recipeNotes = document.getElementById("recipe-notes");
const backButton = document.getElementById("back-button");
const searchInput = document.getElementById("search-input");

// Функция для отображения списка рецептов (принимает массив рецептов)
function displayRecipeList(recipeArray = recipes) {
    recipeListDiv.innerHTML = ""; // Очищаем список

    if (recipeArray.length === 0) {
        recipeListDiv.innerHTML = "<p>Рецепты не найдены.</p>";
        return;
    }

    recipeArray.forEach(recipe => {
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

// Функция для отображения деталей рецепта
function showRecipeDetails(recipeId) {
    const recipe = recipes.find(r => r.id === parseInt(recipeId));

    if (!recipe) {
        console.error("Рецепт не найден:", recipeId);
        // Можно показать сообщение об ошибке на странице
        return;
    }

    fillRecipeDetails(recipe); // Используем функцию для заполнения

    recipeListDiv.style.display = "none";
    recipeDetailsDiv.classList.add("active");
    window.scrollTo(0, 0);
}

// Функция для заполнения деталей рецепта (чтобы не дублировать код)
function fillRecipeDetails(recipe) {
    recipeTitle.textContent = recipe.title;

    recipeIngredients.innerHTML = "<h2>Ингредиенты</h2>";
    const ingredientsList = document.createElement("ul");
    const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : (recipe.ingredients ? recipe.ingredients.split('\n') : []);
    ingredientsArray.forEach(ingredient => {
        const listItem = document.createElement("li");
        listItem.textContent = ingredient;
        ingredientsList.appendChild(listItem);
    });
    recipeIngredients.appendChild(ingredientsList);

    recipeInstructions.innerHTML = "<h2>Приготовление</h2>";
    const instructionsList = document.createElement("ol");
    const instructionsArray = Array.isArray(recipe.instructions) ? recipe.instructions : (recipe.instructions ? recipe.instructions.split('\n') : []);
    instructionsArray.forEach(step => {
        const listItem = document.createElement("li");
        listItem.textContent = step;
        instructionsList.appendChild(listItem);
    });
    recipeInstructions.appendChild(instructionsList);

    recipeMedia.innerHTML = "<h2>Фото и видео</h2>";
    if (recipe.image) {
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
    notesPara.textContent = recipe.notes || ""; // Добавил || "" на случай, если заметок нет.
    recipeNotes.appendChild(notesPara);
}
// Функция для загрузки данных и обработки ошибок
async function loadRecipes() {
    recipeListDiv.innerHTML = '<div class="loader"></div>'; // Показываем спиннер
    try {
        const response = await fetch('/.netlify/functions/get-recipes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        recipes = await response.json();

        // Обработка ошибок при получении данных из Airtable (если, например, структура таблицы изменилась)
        if (!Array.isArray(recipes)) {
            throw new Error("Получены некорректные данные с сервера.");
        }
         if (recipes.length === 0) {
            recipeListDiv.innerHTML = "<p>Рецептов пока нет.</p>";
            return
        }


        displayRecipeList(); // Отображаем список
    } catch (error) {
        console.error("Ошибка загрузки рецептов:", error);
        recipeListDiv.innerHTML = `<p>Не удалось загрузить рецепты.  Попробуйте обновить страницу или зайти позже.</p>`;
    }
}

// Обработчик клика на кнопку "Назад"
backButton.addEventListener("click", () => {
    recipeDetailsDiv.classList.remove("active");
    recipeListDiv.style.display = "grid";
    window.location.hash = "";
    window.scrollTo(0, 0);
});

// Обработчик изменения хеша
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

// Обработчик ввода в поле поиска
searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredRecipes = recipes.filter(recipe => {
        return (
            recipe.title.toLowerCase().includes(searchTerm) ||
            (recipe.description && recipe.description.toLowerCase().includes(searchTerm)) ||
            (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm))) || // ingredients - массив
            (recipe.ingredients && typeof recipe.ingredients === 'string' && recipe.ingredients.toLowerCase().includes(searchTerm))  // ingredients - строка

        );
    });
    displayRecipeList(filteredRecipes);
});

// Загрузка данных и обработка хеша при загрузке страницы
loadRecipes().then(() => {
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
});