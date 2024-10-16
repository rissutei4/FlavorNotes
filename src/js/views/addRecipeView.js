import View from './View.js';
import icons from 'url:../../img/icons.svg'; // Parcel 2
import {validateField} from '../helpers.js';
import {validationRules} from '../config.js';

class AddRecipeView extends View {
    _parentElement = document.querySelector('.upload');
    _successMessage = 'Recipe was successfully uploaded :)';
    _window = document.querySelector('.add-recipe-window');
    _overlay = document.querySelector('.overlay');
    _btnOpen = document.querySelector('.nav__btn--add-recipe');
    _btnClose = document.querySelector('.btn--close-modal');

    _formData = {};

    constructor() {
        super();
        this._addHandlerShowWindow();
        this._addHandlerHideWindow();
    }
//Pop Up work
    toggleWindow() {
        this._overlay.classList.toggle('hidden');
        this._window.classList.toggle('hidden');
        if (!this._window.classList.contains('hidden')) {
            this.renderForm();
        }
    }

    _addHandlerShowWindow() {
        this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
    }

    _addHandlerHideWindow() {
        this._btnClose.addEventListener('click', () => {
            if (this._parentElement.querySelector('.error')) {
                this._captureIngredients();
                this.renderForm(this._formData);
            } else if(this._parentElement.querySelector('.message')) {
                this.toggleWindow();
            } else {
                this.toggleWindow();
            }
        });
        this._overlay.addEventListener('click', this.toggleWindow.bind(this));
    }

    //FORMS and Uploading

    _validateForm(data) {
        const errors = [];

        // Validate general fields (not ingredients)
        for (const [field, value] of Object.entries(data)) {
            const rules = validationRules[field];
            if (rules && field !== 'ingredients') {
                const error = validateField(field, value, rules);
                if (error) errors.push(error);
            }
        }

        // Validate ingredients separately
        const ingredientErrors = validationRules.ingredients.validateIngredient(null, data);
        for (const [field, errorMessage] of Object.entries(ingredientErrors)) {
            errors.push(`${field}: ${errorMessage}`);
        }

        return errors;
    }

    async renderForm(data = {}) {
        const markup = this._generateMarkup(data);
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
        this._addHandlerAddIngredient();
    }

    addHandlerUpload(handler) {
        this._parentElement.addEventListener('submit', (e) => {
            e.preventDefault();
            const dataArr = [...new FormData(this._parentElement)];
            const data = Object.fromEntries(dataArr);
            this._formData = data;

            const errors = this._validateForm(data);

            if (errors.length > 0) {
                this.renderError(errors.join('\n'));
            } else {
                handler(data);
            }
        });
    }

    _generateMarkup(data = {}) {
        const ingredientCount = this._getIngredientCount(data);
        return `
         
                <div class="upload__column">
                    <h3 class="upload__heading">Recipe data</h3>
                    <label>Title</label>
                    <input required name="title" type="text" value="${data.title || ''}" />
                    <label>URL</label>
                    <input required name="sourceUrl" type="text" value="${data.sourceUrl || ''}" />
                    <label>Image URL</label>
                    <input required name="image" type="text" value="${data.image || ''}" />
                    <label>Publisher</label>
                    <input required name="publisher" type="text" value="${data.publisher || ''}" />
                    <label>Prep time</label>
                    <input required name="cookingTime" type="number" value="${data.cookingTime || ''}" />
                    <label>Servings</label>
                    <input required name="servings" type="number" value="${data.servings || ''}" />
                </div>

                <div class="upload__column">
                    <h3 class="upload__heading">Ingredients</h3>
                    <div class="ingredients">
                    ${this._generateIngredientsMarkup(ingredientCount, data)}
                    </div>
                    <button class="btn add-ingredient__btn">
                        <svg>
                            <use href="${icons}#icon-plus-circle"></use>
                        </svg>
                        <span>Add ingredient</span>
                    </button>
                </div>

                <button class="btn upload__btn">
                    <svg>
                        <use href="${icons}#icon-upload-cloud"></use>
                    </svg>
                    <span>Upload</span>
                </button>
                        `;
    }

//JUST INGREDIENTS
    _addHandlerAddIngredient() {
        const addIngredientBtn = this._parentElement.querySelector('.add-ingredient__btn');
        if (addIngredientBtn) {
            addIngredientBtn.addEventListener('click', this._handleAddIngredient.bind(this));
        }
    }

    _handleAddIngredient(e) {
        e.preventDefault();
        const ingredientsContainer = this._parentElement.querySelector('.ingredients');
        const ingredientInputs = ingredientsContainer.querySelectorAll('.ingredient-cont');
        const nextIngredientNum = ingredientInputs.length + 1;
        ingredientsContainer.insertAdjacentHTML('beforeend', this._generateIngredientMarkup(nextIngredientNum));
    }
    _generateIngredientMarkup(i, data = {}) {
        const isRequired = i <= 1;
        return `
                <div class="ingredient-cont">
                    <label>Ingredient ${i}</label>
                    <input
                        type="number"
                        name="ingredient-${i}-quantity"
                        placeholder="Quantity"
                        class="upload-quantity"
                        value="${data[`ingredient-${i}-quantity`] || ''}"
                        ${isRequired ? 'required' : ''}
                    />
                    <input
                        type="text"
                        name="ingredient-${i}-unit"
                        placeholder="kg, gr..."
                        class="upload-unit"
                        value="${data[`ingredient-${i}-unit`] || ''}"
                        ${isRequired ? 'required' : ''}
                    />
                    <input
                        type="text"
                        name="ingredient-${i}-desc"
                        placeholder="Item Description"
                        class="upload-item"
                        value="${data[`ingredient-${i}-desc`] || ''}"
                        ${isRequired ? 'required' : ''}
                    />
                </div>
            `;
    }

    _getIngredientCount(data) {
        let count = 3; // Start with 3 as the minimum
        while (data[`ingredient-${count + 1}-quantity`] ||
        data[`ingredient-${count + 1}-unit`] ||
        data[`ingredient-${count + 1}-desc`]) {
            count++;
        }
        return count;
    }
    _generateIngredientsMarkup(count, data) {
        let markup = '';
        for (let i = 1; i <= count; i++) {
            markup += this._generateIngredientMarkup(i, data);
        }
        return markup;
    }

    _captureIngredients() {
        const ingredients = [];
        const ingredientFields = this._parentElement.querySelectorAll('.ingredients input');
        ingredientFields.forEach((input, index) => {
            const quantity = input.querySelector('[name="quantity"]').value;
            const unit = input.querySelector('[name="unit"]').value;
            const desc = input.querySelector('[name="description"]').value;
            if (quantity || unit || desc) {
                ingredients.push({quantity, unit, desc});
            }
        });
        this._formData.ingredients = ingredients;
    }
}

export default new AddRecipeView();