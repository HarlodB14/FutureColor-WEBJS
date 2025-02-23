import ValidationResult from "./ValidationResult.js";

export default class FormValidator {
    validateForm(values) {
        let validationResult = new ValidationResult(true);

        if (!values[0]) {
            validationResult.addError("structureSelect", "Structuur is verplicht.");
        }

        let mixingTime = parseInt(values[1]);
        if (!values[1] || isNaN(mixingTime) || mixingTime < 1 || mixingTime > 10000) {
            validationResult.addError("amountOfMixingTime", "Mixing tijd moet een getal tussen 1 en 10000 milliseconden zijn.");
        }

        let mixingSpeed = parseInt(values[2]);
        if (!values[2] || isNaN(mixingSpeed) || mixingSpeed < 1 || mixingSpeed > 100) {
            validationResult.addError("mixingSpeed", "Mixing snelheid moet een getal tussen 1 en 100 zijn.");
        }

        let color = values[3].trim();

        // Correcte HSL-regex, inclusief flexibele spaties
        let hslPattern = /^hsl\(\s?(0|[1-9][0-9]?|[1-3][0-5][0-9]|360),\s?(100|[0-9]{1,2})%?,\s?(100|[0-9]{1,2})%?\)$/i;

        if (!hslPattern.test(color)) {
            validationResult.addError("color", "Kleur moet in HSL-formaat zijn (bijv. hsl(120, 50%, 50%)).");
        }

        if (validationResult.errors.length > 0) {
            validationResult.isValid = false;
        }

        return validationResult;
    }

}