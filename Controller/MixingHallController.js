import Ingredient from "../Model/Ingredient.js";
import MixingHall from "../Model/MixingHall.js";
import MixingHallView from "../View/MixingHallView.js";
import FormValidator from "../Helpers/FormValidator.js";
import WeatherSystem from "../Model/WeatherSystem.js";

export default class MixingHallController {
    constructor() {
        this.mixingHall = new MixingHall();
        this.weatherSystem = new WeatherSystem();
        this.view = new MixingHallView(this);
        
        // Set up a timer to check for weather updates every 10 seconds
        setInterval(() => this.updateWeatherDisplay(), 10000);
        
        // Initial weather display after a short delay to allow for API fetch
        setTimeout(() => this.updateWeatherDisplay(), 1000);

        // Mouse actions binding
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
    }
    
    // Update the weather display in the view with current data
    updateWeatherDisplay() {
        try {
            const temperature = this.weatherSystem.getTemperature();
            const isPrecipitation = this.weatherSystem.hasPrecipitation();
            
            // Update the view with the latest weather data
            this.view.updateWeatherText(temperature, isPrecipitation);
        } catch (error) {
            console.error("Error updating weather display:", error);
            // Update with default values to prevent being stuck on loading
            this.view.updateWeatherText(20, false);
        }
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