import Ingredient from "../Model/Ingredient.js";
import MixingHall from "../Model/MixingHall.js";
import MixingHallView from "../View/MixingHallView.js";
import FormValidator from "../Helpers/FormValidator.js";

export default class MixingHallController {
    constructor() {
        this.mixingHall = new MixingHall();
        this.view = new MixingHallView(this);
        this.view.drawIngredientForm();
        this.view.drawMixingPots(this.mixingHall.mixingPots);
        this.view.drawAddPotButton();
    }

    createMixingPot() {
        let id = this.mixingHall.mixingPots.length;
        let mixingPot = { id };
        this.mixingHall.mixingPots.push(mixingPot);
        this.view.drawMixingPots(this.mixingHall.mixingPots);
    }

    handleFormData(e, form) {
        e.preventDefault();
        const structure = form.querySelector('#structureSelect').value;
        const amountOfMixingTime = form.querySelector('#amountOfMixingTime').value;
        const mixingSpeed = form.querySelector('#mixingSpeed').value;
        let color = form.querySelector('#color').value.trim();

        let validator = new FormValidator();
        let result = validator.validateForm([structure, amountOfMixingTime, mixingSpeed, color]);

        if (result.isValid) {
            const ingredient = new Ingredient(amountOfMixingTime, mixingSpeed, color, structure);
            this.mixingHall.ingredients.push(ingredient);
            this.view.drawIngredients(this.mixingHall.ingredients);
        } else {
            this.view.showValidationErrors(result.errors, form);
        }
    }

    getIngredients() {
        return this.mixingHall.ingredients;
    }
}