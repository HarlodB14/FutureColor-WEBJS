import Ingredient from "../Model/Ingredient.js";
import Structures from "../Enums/Structures.js";
import MixingHallView from "../View/MixingHallView.js";
import FormValidator from "../Helpers/FormValidator.js";

export default class MixingHallController {

    createdIngredients = [];

    constructor() {
        this.view = new MixingHallView(this);
    }

    handleFormData(e, form) {
        e.preventDefault();
        const structure = form.querySelector('#structureSelect').value;
        const amountOfMixingTime = form.querySelector('#amountOfMixingTime').value;
        const mixingSpeed = form.querySelector('#mixingSpeed').value;
        let color = form.querySelector('#color').value.trim(); // Verwijder extra spaties

        // Check of de gebruiker de invoer niet in het volledige hsl() formaat heeft gegeven
        let hslParts = color.match(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/);
        if (hslParts) {
            // Vorm om naar het correcte hsl-formaat
            color = `hsl(${hslParts[1]}, ${hslParts[2]}%, ${hslParts[3]}%)`;
        }

        let values = [structure, amountOfMixingTime, mixingSpeed, color];
        let validator = new FormValidator();
        let result = validator.validateForm(values);

        if (result.isValid) {
            const ingredient = new Ingredient(amountOfMixingTime, mixingSpeed, color, structure);
            this.drawIngredient(ingredient);
            console.log('New Ingredient:', ingredient);
        } else {
            this.showValidationErrors(result.errors, form);
        }
    }

    drawIngredient(ingredient) {
        let container = document.getElementById("ingredientsContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "ingredientsContainer";
            container.style.display = "flex";
            container.style.flexWrap = "wrap";
            container.style.gap = "10px";
            container.style.marginTop = "20px";
            document.body.appendChild(container);
        }

        let ingredientDiv = document.createElement("div");
        let { width, height, borderRadius, boxShadow, animation, innerText } = this.getShapeStyles(ingredient.structure);

        ingredientDiv.style.width = width;
        ingredientDiv.style.height = height;
        ingredientDiv.style.backgroundColor = ingredient.color;
        ingredientDiv.style.borderRadius = borderRadius;
        ingredientDiv.style.boxShadow = boxShadow;
        ingredientDiv.style.margin = "10px";
        ingredientDiv.style.border = "2px solid black";
        ingredientDiv.style.animation = animation;

        if (innerText) {
            ingredientDiv.innerText = innerText;
            ingredientDiv.style.color = "white";
            ingredientDiv.style.fontSize = "12px";
            ingredientDiv.style.textAlign = "center";
            ingredientDiv.style.lineHeight = height;
        }

        container.appendChild(ingredientDiv);
    }






    drawIngredientForm() {
        let structures = Object.values(Structures);
        this.view.draw(structures);
    }

    getShapeStyles(structure) {
        let styles = {
            width: "50px",
            height: "50px",
            innerText: '',
            borderRadius: "0%",
            boxShadow: "none",
            animation: "none",
            position: "relative", //slijmerig effect
            filter: "none",
        };

        switch (structure) {
            case "korrel":
                styles.width = "20px";
                styles.innerText = "K";
                styles.height = "20px";
                styles.borderRadius = "50%";
                break;
            case "grove korrel":
                styles.width = "60px";
                styles.innerText = "GK";
                styles.height = "60px";
                styles.borderRadius = "90%";
                styles.boxShadow = "inset 0px 0px 10px rgba(0,0,0,0.2)"; // Poeder effect
                break;
            case "glad":
                styles.width = "50px";
                styles.innerText = "G";
                styles.height = "50px";
                styles.borderRadius = "5px";
                break;
            case "slijmerig":
                styles.width = "6px";
                styles.innerText = "S";
                styles.height = "2";
                styles.borderRadius = "60%";
                styles.boxShadow = "5px 10px 20px rgba(0, 255, 0, 0.6)";
                styles.filter = "blur(2px)";
                break;
        }

        return styles;
    }


    showValidationErrors(errors, form) {
        //view updaten van errors
        form.querySelectorAll(".error-message").forEach(error => error.remove());

        errors.forEach(error => {
            let field = form.querySelector(`#${error.field}`);
            if (field) {
                let errorSpan = document.createElement("span");
                errorSpan.className = "error-message";
                errorSpan.style.color = "red";
                errorSpan.innerText = error.message;
                field.parentNode.appendChild(errorSpan);
            }
        });
    }
}