let recipes = [];
let allCategories = []; // Массив для хранения *всех* уникальных категорий

const recipeListDiv = document.getElementById("recipe-list");
const recipeDetailsDiv = document.getElementById("recipe-details");
const recipeTitle = document.getElementById("recipe-title");
const recipeIngredients = document.getElementById("recipe-ingredients");
const recipeInstructions = document.getElementById("recipe-instructions");
const recipeMedia = document.getElementById("recipe-media");
const recipeNotes = document.getElementById("recipe-notes");
const backButton = document.getElementById("back-button");
const searchInput = document.getElementById("search-input");
const categoryFiltersDiv = document.getElementById("category-filters");
const recipeCategoriesDiv = document.getElementById("recipe-categories"); // Добавили

// Функция для отображения списка рецептов
function displayRecipeList(recipeArray = recipes) {
    recipeListDiv.innerHTML = ""; // Очищаем

    if (recipeArray.length === 0) {
        recipeListDiv.innerHTML = "<p>Рецепты не найдены.</p>";
        return;
    }

    recipeArray.forEach(recipe => {
        const recipeItem = document.createElement("div");
        recipeItem.classList.add("recipe-item");

        // Добавляем категории на карточку (если есть)
        let categoriesHTML = '';
        if (recipe.categories && recipe.categories.length > 0) {
            categoriesHTML = `<div class="recipe-categories">`;
            recipe.categories.forEach(category => {
                categoriesHTML += `<span class="category-badge">${category}</span>`;
            });
            categoriesHTML += `</div>`;
        }
        recipeItem.innerHTML = `
            ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ''}
            <div class="recipe-item-content">
                <a href="#"><h2>${recipe.title}</h2></a>
                <p>${recipe.description || ""}</p>
                 ${categoriesHTML}
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
  // ... (предыдущий код showRecipeDetails) ...
   const recipe = recipes.find(r => r.id === parseInt(recipeId));
    if (!recipe) {
      console.error("Рецепт не найден:", recipeId);
      return;
    }

    fillRecipeDetails(recipe); //Заполняем данными

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
    notesPara.textContent = recipe.notes || "";
    recipeNotes.appendChild(notesPara);

     //Категории в деталях
    recipeCategoriesDiv.innerHTML = "<h2>Категории</h2>";
    if(recipe.categories && recipe.categories.length > 0){
        const categoriesList = document.createElement("ul");
        recipe.categories.forEach(category => {
          const listItem = document.createElement("li");
          listItem.textContent = category;
          categoriesList.appendChild(listItem);
        });
        recipeCategoriesDiv.appendChild(categoriesList);

    } else {
      recipeCategoriesDiv.innerHTML += "<p>Категории не указаны</p>";
    }
}

// Функция для загрузки данных
async function loadRecipes() {
    recipeListDiv.innerHTML = '<div class="loader"></div>';
    try {
        const response = await fetch('/.netlify/functions/get-recipes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        recipes = await response.json();

        if (!Array.isArray(recipes)) {
            throw new Error("Получены некорректные данные с сервера.");
        }

        if (recipes.length === 0) {
            recipeListDiv.innerHTML = "<p>Рецептов пока нет.</p>";
            return;
        }

        // Собираем все уникальные категории
        recipes.forEach(recipe => {
            if (recipe.categories) {
                recipe.categories.forEach(category => {
                    if (!allCategories.includes(category)) {
                        allCategories.push(category);
                    }
                });
            }
        });

        displayRecipeList();      // Отображаем список
        displayCategoryFilters(); // Отображаем фильтры категорий

    } catch (error) {
        console.error("Ошибка загрузки рецептов:", error);
        recipeListDiv.innerHTML = `<p>Не удалось загрузить рецепты. Попробуйте обновить страницу или зайти позже.</p>`;
    }
}

// Функция для отображения кнопок фильтрации по категориям
function displayCategoryFilters() {
    categoryFiltersDiv.innerHTML = ""; // Очищаем

    // Кнопка "Все рецепты"
    const allButton = document.createElement("button");
    allButton.textContent = "Все рецепты";
    allButton.classList.add("category-button", "active"); // Активная кнопка по умолчанию
    allButton.addEventListener("click", () => {
        displayRecipeList(); // Показываем все рецепты
        setActiveCategoryButton(allButton); // Делаем кнопку активной
    });
    categoryFiltersDiv.appendChild(allButton);

    // Кнопки для каждой категории
    allCategories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category;
        button.classList.add("category-button");
        button.addEventListener("click", () => {
            filterByCategory(category);  // Фильтруем по категории
            setActiveCategoryButton(button); // Делаем кнопку активной
        });
        categoryFiltersDiv.appendChild(button);
    });
}

// Функция для фильтрации рецептов по категории
function filterByCategory(category) {
    const filteredRecipes = recipes.filter(recipe => {
        return recipe.categories && recipe.categories.includes(category);
    });
    displayRecipeList(filteredRecipes);
}

// Функция для установки активной кнопки категории
function setActiveCategoryButton(activeButton) {
    // Убираем класс "active" у всех кнопок
    const buttons = document.querySelectorAll(".category-button");
    buttons.forEach(button => button.classList.remove("active"));

    // Добавляем класс "active" к нажатой кнопке
    activeButton.classList.add("active");
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
  // ... (предыдущий код) ...
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
 // ... (предыдущий код) ...
  const searchTerm = searchInput.value.toLowerCase();
    const filteredRecipes = recipes.filter(recipe => {
      //Добавил поиск и по категориям
        return (
            recipe.title.toLowerCase().includes(searchTerm) ||
            (recipe.description && recipe.description.toLowerCase().includes(searchTerm)) ||
            (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm))) ||
            (recipe.ingredients && typeof recipe.ingredients === 'string' && recipe.ingredients.toLowerCase().includes(searchTerm))||
            (recipe.categories && recipe.categories.some(cat => cat.toLowerCase().includes(searchTerm)))

        );
    });
    displayRecipeList(filteredRecipes);
});

// Динамический год в подвале
document.getElementById("current-year").textContent = new Date().getFullYear();

// Загрузка данных и обработка хеша при старте
loadRecipes().then(() => {
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
});