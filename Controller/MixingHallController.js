import Ingredient from "../Model/Ingredient.js";
import Structures from "../Enums/Structures.js";
import MixingHallView from "../View/MixingHallView.js";

class MixingHallController {
    constructor() {
        this.view = new MixingHallView(this);
    }

    handleFormData(e, form) {
        e.preventDefault();
        console.log("Form submission prevented");

        const structure = form.querySelector('#structureSelect').value;
        const amountOfMixingTime = form.querySelector('#amountOfMixingTime').value;
        const mixingSpeed = form.querySelector('#mixingSpeed').value;
        const color = form.querySelector('#color').value;

        const newIngredient = new Ingredient(amountOfMixingTime, mixingSpeed, color, structure);
        console.log('New Ingredient:', newIngredient);
    }

    drawIngredientForm() {
        let structures = Object.values(Structures);
        this.view.draw(structures);
    }
}

export default MixingHallController;