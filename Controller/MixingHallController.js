import Ingredient from "../Model/Ingredient.js";
import MixingHall from "../Model/MixingHall.js";
import MixingHallView from "../View/MixingHallView.js";
import FormValidator from "../Helpers/FormValidator.js";

export default class MixingHallController {
    constructor() {
        this.mixingHall = new MixingHall();
        this.view = new MixingHallView(this);
        
        // First draw the layout, then the components
        this.view.drawIngredientForm();
        this.view.drawMixingPots(this.mixingHall.mixingPots);
        this.view.drawButtonContainer();
        this.view.drawMixingMachines(this.mixingHall.mixMachines);

        // Mouse actions binding
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
    }

    mouseMove(e) {
        let ingredientTop = this.draggedElement;
        if (!ingredientTop) return;

        let newX = e.clientX - this.startX;
        let newY = e.clientY - this.startY;

        ingredientTop.style.top = `${ingredientTop.offsetTop + newY}px`;
        ingredientTop.style.left = `${ingredientTop.offsetLeft + newX}px`;

        this.startX = e.clientX;
        this.startY = e.clientY;
    }

    mouseUp() {
        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("mouseup", this.mouseUp);
        this.draggedElement = null;
    }

    mouseDown(e) {
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.draggedElement = e.target;

        document.addEventListener("mousemove", this.mouseMove);
        document.addEventListener("mouseup", this.mouseUp);
    }

    createMixingPot() {
        let id = this.mixingHall.mixingPots.length;
        let mixingPot = { id, ingredients: [] };
        this.mixingHall.mixingPots.push(mixingPot);
        this.view.drawMixingPots(this.mixingHall.mixingPots);
    }

    createMixingMachine() {
        let id = this.mixingHall.mixMachines.length;
        let mixMachine = { id, pot_contents: [], mixingSpeed: 0, mixingTime: 0, };
        this.mixingHall.mixMachines.push(mixMachine);
        this.view.drawMixingMachines(this.mixingHall.mixMachines);
    }

    handleFormData(e, form) {
        e.preventDefault();
        const structure = form.querySelector("#structureSelect").value;
        const amountOfMixingTime = form.querySelector("#amountOfMixingTime").value;
        const mixingSpeed = form.querySelector("#mixingSpeed").value;
        let color = form.querySelector("#color").value.trim();

        let validator = new FormValidator();
        let result = validator.validateForm([
            structure,
            amountOfMixingTime,
            mixingSpeed,
            color,
        ]);

        if (result.isValid) {
            const ingredient = new Ingredient(
                amountOfMixingTime,
                mixingSpeed,
                color,
                structure
            );
            this.mixingHall.ingredients.push(ingredient);
            this.view.drawIngredients(this.mixingHall.ingredients);
        } else {
            this.view.showValidationErrors(result.errors, form);
        }
    }

    dropIngredient(ingredientIndex, potIndex) {
        const ingredient = this.mixingHall.ingredients.splice(ingredientIndex, 1)[0];
        this.mixingHall.mixingPots[potIndex].ingredients.push(ingredient);
        this.view.drawMixingPots(this.mixingHall.mixingPots);
        this.view.drawIngredients(this.mixingHall.ingredients);
    }

    removeIngredient(index) {
        this.mixingHall.removeIngredient(index);
        this.view.drawIngredients(this.mixingHall.ingredients);
    }

    getIngredientByIndex(index) {
        return this.mixingHall.ingredients[index];
    }

    getIngredients() {
        return this.mixingHall.ingredients;
    }
}