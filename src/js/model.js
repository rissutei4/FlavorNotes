import {async} from 'regenerator-runtime/runtime';
import {API_URL, RES_PER_PAGE, API_KEY} from './config.js'
import {AJAX} from "./helpers.js";

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        resultsPerPage: RES_PER_PAGE,
        page: 1,
    },
    bookmarks: [],
};
const createRecipeObject = function (data) {
    const {recipe} = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        source: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cooking_time: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key}),
    };

}
export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
        state.recipe = createRecipeObject(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id)) state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;

        console.log(state.recipe)
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;

        const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && {key: rec.key}),
            }
        })
        state.search.page = 1;
    } catch (err) {
        console.log(`${err}`)
        throw err;
    }
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage//0;
    const end = page * state.search.resultsPerPage//9;

    return state.search.results.slice(start, end)
}
export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = ing.quantity * newServings / state.recipe.servings;
        //new qt oldqt * newServings/old servings
    });
    state.recipe.servings = newServings;
}

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
    state.bookmarks.push(recipe);

    //Mark the recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
    persistBookmarks();
}

export const deleteBookmark = function (id) {
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);
    if (id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmarks();
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}
init();

const clearBookmarks = function () {
    localStorage.clear('bookmarks');
}

export const uploadRecipe = async function (newRecipe) {
    try {
      const ingredientEntries = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '');

        const ingredientsByNumber = {};

        ingredientEntries.forEach(([key, value]) => {
            const [_, number, field] = key.split('-');

            if (!ingredientsByNumber[number]) {
                ingredientsByNumber[number] = {};
            }
            ingredientsByNumber[number][field] = value.trim();
        })


        const ingredients = Object.values(ingredientsByNumber).filter(ing => Object.values(ing).some(value => value !== '')).map(ing => ({
            quantity: ing.quantity ? +ing.quantity : null,
            unit: ing.unit || '',
            description: ing.desc ||'',
            //the desc comes based on the name of the input class.
        }));

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        }
        const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (err) {
        throw err
    }
}
// clearBookmarks()

