export const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes/';
export const TIMEOUT_SEC = 10;
export const RES_PER_PAGE = 10;
export const API_KEY = '84686280-10a0-4a35-92b1-a84289f28568';
export const MODAL_CLOSE_SEC = 2.5;

export const MODAL_RENDER_FORM_SEC = 0.5;

export const validationRules = {
    title: {
        required: true,
        minLength: 3,
        message: 'Title must be at least 3 characters long.',
    },
    sourceUrl: {
        required: true,
        minLength: 5,
        isUrl: true,
        message: 'Source URL must be at least 5 characters long.',
    },
    image: {
        required: true,
        minLength: 5,
        isUrl: true,
        message: 'Source URL is required and must be at least 5 characters long.',
    },
    cookingTime: {
        required: true,
        isNumber: true,
        min: 15,
        max: 1000,
        message: (value, {
            min,
            max
        }) => `Cooking time must be a positive number, the minimum value is ${min} and maximum ${max}`,
    },
    servings: {
        required: true,
        isNumber: true,
        min: 1,
        message: 'Servings must be a positive number.',
    },
    ingredients: {
        validateIngredient: (value, formValues) => {
            const errors = {};
            const ingredientEntries = Object.entries(formValues).filter(entry => entry[0].startsWith('ingredient'));

            // Group ingredients by their index
            const ingredients = {};
            ingredientEntries.forEach(([field, value]) => {
                const [_, index, type] = field.split('-');
                if (!ingredients[index]) ingredients[index] = {};
                ingredients[index][type] = value;
            });

            // Validate each ingredient group
            Object.keys(ingredients).forEach(index => {
                const {desc, unit, quantity} = ingredients[index];

                if (desc || unit || quantity) {
                    if (!desc) {
                        errors[`ingredient-${index}-desc`] = 'Ingredient description is required.';
                    }
                    if (quantity) {
                        if (isNaN(quantity)) {
                            errors[`ingredient-${index}-quantity`] = 'Quantity must be a number.';
                        } else if (Number(quantity) <= 0) {
                            errors[`ingredient-${index}-quantity`] = 'Quantity must be positive.';
                        }
                        if (!unit) {
                            errors[`ingredient-${index}-unit`] = 'Unit is required.';
                        }
                    }
                    if (unit) {
                        if (!isNaN(unit)) {
                            errors[`ingredient-${index}-unit`] = 'Do not use numbers in unit fields.';
                        }
                    }
                }
            });

            return errors;
        }
    }
};

