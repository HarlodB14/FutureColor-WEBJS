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

        // Fixed HSL pattern that accepts all valid HSL values
        // This pattern accepts any 1-3 digit numbers for hue, saturation, and lightness
        let hslPattern = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i;

        if (!hslPattern.test(color)) {
            validationResult.addError("color", "Kleur moet in HSL-formaat zijn (bijv. hsl(120, 50%, 50%)).");
        } else {
            // If the pattern matches, let's also validate the numeric ranges
            const matches = color.match(hslPattern);
            if (matches) {
                const h = parseInt(matches[1], 10);
                const s = parseInt(matches[2], 10);
                const l = parseInt(matches[3], 10);
                
                if (h < 0 || h > 360) {
                    validationResult.addError("color", "Hue (eerste waarde) moet tussen 0 en 360 zijn.");
                }
                if (s < 0 || s > 100) {
                    validationResult.addError("color", "Saturation (tweede waarde) moet tussen 0% en 100% zijn.");
                }
                if (l < 0 || l > 100) {
                    validationResult.addError("color", "Lightness (derde waarde) moet tussen 0% en 100% zijn.");
                }
            }
        }

        if (validationResult.errors.length > 0) {
            validationResult.isValid = false;
        }

        return validationResult;
    }
}