import CreateInput from "../Helpers/CreateInput.js";
import Structures from "../Enums/Structures.js";

export default class IngredientView {
    constructor(controller, mixingPotContents) {
        this.controller = controller;
        this.mixingPotContents = mixingPotContents;
        
        // Bind methods to this instance
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.showMixingSpeedTooltip = this.showMixingSpeedTooltip.bind(this);
        this.hideMixingSpeedTooltip = this.hideMixingSpeedTooltip.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    drawIngredientForm() {
        const container = document.createElement('div');
        container.className = 'formContainer';
        
        const form = document.createElement('form');
        form.className = 'ingredient-form';

        const structureLabel = document.createElement('label');
        structureLabel.setAttribute('for', 'structureSelect');
        structureLabel.textContent = 'Structuur:';
        form.appendChild(structureLabel);

        let structureSelect = document.createElement('select');
        structureSelect.name = 'structure';
        structureSelect.id = 'structureSelect';

        Structures.getValues().forEach((structure) => {
            let option = document.createElement('option');
            option.value = structure;
            option.textContent = structure;
            structureSelect.appendChild(option);
        });

        form.appendChild(structureSelect);

        let createInput = new CreateInput();
        form.appendChild(createInput.createInputField('Mengtijd (ms)', 'amountOfMixingTime', 'number'));
        form.appendChild(createInput.createInputField('Mengsnelheid', 'mixingSpeed', 'number'));
        
        // Create a container for the color input and color picker
        const colorContainer = document.createElement('div');
        colorContainer.className = 'color-input-container';
        
        // Create the color input field
        const colorFieldContainer = createInput.createInputField('Kleur (HSL)', 'color', 'text');
        colorContainer.appendChild(colorFieldContainer);
        
        // Get the actual input element inside the container
        const colorInput = colorFieldContainer.querySelector('input');
        colorInput.placeholder = 'hsl(120, 50%, 50%)';
        
        // Add color picker next to the text input
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.id = 'colorPicker';
        colorPicker.className = 'color-picker';
        colorContainer.appendChild(colorPicker);
        
        // Add event listener to update the HSL text input when the color picker changes
        colorPicker.addEventListener('input', () => {
            const hexColor = colorPicker.value;
            const hslColor = this.hexToHSL(hexColor);
            colorInput.value = hslColor;
        });
        
        // Add event listener to update the color picker when the HSL text input changes
        colorInput.addEventListener('input', () => {
            try {
                const hslColor = colorInput.value;
                if (hslColor.startsWith('hsl(') && hslColor.endsWith(')')) {
                    const hexColor = this.hslToHex(hslColor);
                    colorPicker.value = hexColor;
                }
            } catch (e) {
                // Do nothing if parsing fails - let form validation handle errors
            }
        });
        
        form.appendChild(colorContainer);

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Ingrediënt aanmaken';
        form.appendChild(submitButton);

        // Add weather text below the form
        const weatherText = document.createElement('div');
        weatherText.id = 'weatherText';
        weatherText.textContent = 'Temperatuur: Laden... | Neerslag: Laden...';
        form.appendChild(weatherText);

        container.appendChild(form);
        document.body.appendChild(container);

        form.addEventListener('submit', (e) => this.controller.handleFormData(e, form));

        // Set default value for color picker and input
        colorPicker.value = '#00ff00'; // Default to green
        colorInput.value = 'hsl(120, 100%, 50%)'; // Green in HSL
    }

    drawIngredients(ingredients) {
        let container = document.getElementById("ingredientsContainer");

        if (container) {
            container.remove();
        }

        let areaContainer = document.getElementById("mixingAreaContainer");
        if (!areaContainer) {
            return; // The container should already exist from setupLayout
        }

        container = document.createElement("div");
        container.id = "ingredientsContainer";
        areaContainer.appendChild(container);

        container.innerHTML = ''; // Reset the container

        ingredients.forEach((ingredient, index) => {
            let ingredientDiv = document.createElement("div");
            ingredientDiv.className = 'ingredient';
            
            // Add specific class based on structure
            ingredientDiv.classList.add(this.getStructureClass(ingredient.structure));
            
            // Set background color - kept as inline style since it's dynamic content
            ingredientDiv.style.backgroundColor = ingredient.color;
            ingredientDiv.style.lineHeight = this.getLineHeight(ingredient.structure);
            
            ingredientDiv.draggable = true;
            ingredientDiv.setAttribute('data-index', index);
            ingredientDiv.setAttribute('data-mixing-speed', ingredient.mixingSpeed);

            // Add hover event listeners for tooltip
            ingredientDiv.addEventListener("mouseenter", this.showMixingSpeedTooltip);
            ingredientDiv.addEventListener("mouseleave", this.hideMixingSpeedTooltip);

            ingredientDiv.addEventListener("dragstart", this.onDragStart);
            ingredientDiv.addEventListener("dragover", this.onDragOver);
            ingredientDiv.addEventListener("drop", this.onDrop);

            ingredientDiv.innerText = this.getStructureText(ingredient.structure);
            container.appendChild(ingredientDiv);
        });
    }

    drawMixingPots(mixingPots) {
        let areaContainer = document.getElementById("mixingAreaContainer");
        if (!areaContainer) {
            return; // The container should already exist from setupLayout
        }

        let container = document.getElementById("mixingPotsContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "mixingPotsContainer";
            areaContainer.appendChild(container);
        }

        // Clear all existing pots so we can redraw them with correct indexes
        container.innerHTML = "";
        
        // For debugging
        console.log("Potten tekenen, huidige mixingPots array:", mixingPots);
        console.log("Huidige mixingPotContents Map:", new Map(this.mixingPotContents));
        
        // Now create pots with updated indexes
        mixingPots.forEach((pot, index) => {
            // Create a container for the pot and its remove button
            const potContainer = document.createElement("div");
            potContainer.className = "mixing-pot-container";
            
            // Create the pot element
            const potDiv = document.createElement("div");
            potDiv.className = "mixing-pot";
            potDiv.draggable = true;
            potDiv.addEventListener("mousedown", (e) => this.mouseDown(e));
            potDiv.setAttribute("data-index", index);
            potDiv.setAttribute("data-mixing-speed", "");
            potDiv.addEventListener("dragstart", this.onDragStart);
            potDiv.addEventListener("dragover", this.onDragOver);
            potDiv.addEventListener("drop", this.onDrop);
            
            // Create the remove button
            const removeButton = document.createElement("button");
            removeButton.className = "remove-button pot-remove-button";
            removeButton.textContent = "X";
            removeButton.addEventListener("click", () => this.removePot(index));
            
            // Add both elements to the container
            potContainer.appendChild(potDiv);
            potContainer.appendChild(removeButton);
            container.appendChild(potContainer);

            // Initialize the tracking in the view to exactly match the model
            // This is the most important step to avoid duplication
            this.mixingPotContents.set(index.toString(), [...(pot.contents || [])]);

            // Draw the ingredients inside the pot
            this.updatePotContents(potDiv, index.toString());
        });
        
        // For debugging: log the current state after update
        console.log("Na het tekenen, mixingPotContents Map:", new Map(this.mixingPotContents));
    }

    removePot(index) {
        // Call the controller method to remove the pot
        this.controller.removeMixingPot(index);
    }

    updatePotContents(potDiv, potIndex) {
        // Clear existing content
        potDiv.innerHTML = "";

        const potIndexNum = parseInt(potIndex, 10);
        
        // Get contents from the model directly (source of truth)
        // Only use mixingPotContents as a fallback
        let contents = [];
        
        if (this.controller.mixingPots[potIndexNum] && 
            this.controller.mixingPots[potIndexNum].contents) {
            // Get from model (preferred)
            contents = this.controller.mixingPots[potIndexNum].contents;
        } else if (this.mixingPotContents.has(potIndex)) {
            // Fallback to the view's tracking
            contents = this.mixingPotContents.get(potIndex);
        }
        
        // Log for debugging
        console.log(`Bijwerken van pot ${potIndex} inhoud:`, contents);

        // Update pot's mixing speed attribute from first ingredient (if exists)
        if (contents.length > 0) {
            potDiv.setAttribute('data-mixing-speed', contents[0].mixingSpeed);
            
            // Create a small label showing the pot's mixing speed
            const speedLabel = document.createElement('div');
            speedLabel.className = 'pot-mixing-speed';
            speedLabel.textContent = `Snelheid: ${contents[0].mixingSpeed}`;
            
            potDiv.appendChild(speedLabel);
        } else {
            // Reset mixing speed if no ingredients
            potDiv.setAttribute('data-mixing-speed', '');
        }

        // Create visual representation of each ingredient
        contents.forEach((ingredient) => {
            let ingredientDiv = document.createElement("div");
            ingredientDiv.className = 'ingredient';
            ingredientDiv.classList.add(this.getStructureClass(ingredient.structure));
            
            // Only set the background color as inline style since it's dynamic
            ingredientDiv.style.backgroundColor = ingredient.color;
            
            ingredientDiv.innerText = this.getStructureText(ingredient.structure);
            ingredientDiv.setAttribute('data-mixing-speed', ingredient.mixingSpeed);
            
            // Add hover event listeners to pot ingredients as well
            ingredientDiv.addEventListener("mouseenter", this.showMixingSpeedTooltip);
            ingredientDiv.addEventListener("mouseleave", this.hideMixingSpeedTooltip);
            
            potDiv.appendChild(ingredientDiv);
        });
    }

    // Method to show tooltip
    showMixingSpeedTooltip(e) {
        const mixingSpeed = e.target.getAttribute('data-mixing-speed');
        
        let tooltip = document.createElement('div');
        tooltip.className = 'mixing-speed-tooltip';
        tooltip.textContent = `mengsnelheid: ${mixingSpeed}`;
        
        e.target.appendChild(tooltip);
    }

    // Method to hide tooltip
    hideMixingSpeedTooltip(e) {
        const tooltip = e.target.querySelector('.mixing-speed-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    onDragStart(e) {
        e.dataTransfer.setData("text", e.target.dataset.index);
    }

    onDragOver(e) {
        e.preventDefault();
    }

    onDrop(e) {
        e.preventDefault();
        const draggedIndex = e.dataTransfer.getData("text");
        let targetPot = e.target.closest("[data-index]");

        if (!targetPot) return;

        const targetPotIndex = targetPot.dataset.index;
        const potIndexNum = parseInt(targetPotIndex, 10);
        
        // Check if the pot exists in the model
        if (!this.controller.mixingPots[potIndexNum]) {
            console.error(`Pot met index ${potIndexNum} niet gevonden in model`);
            return;
        }
        
        // Initialize the view's tracking if needed
        if (!this.mixingPotContents.has(targetPotIndex)) {
            this.mixingPotContents.set(targetPotIndex, []);
        }
        
        // Get the dragged ingredient
        const ingredient = this.controller.getIngredientByIndex(draggedIndex);
        if (!ingredient) return;
        
        // Check pot contents from the model (source of truth)
        const modelPotContents = this.controller.mixingPots[potIndexNum].contents || [];
        
        // Get current pot mixing speed (if any ingredients exist)
        const potMixingSpeed = targetPot.getAttribute('data-mixing-speed');
        const ingredientMixingSpeed = ingredient.mixingSpeed;
        
        // Check if this is the first ingredient or if mixing speeds match
        if (modelPotContents.length === 0) {
            // First ingredient - set the pot's mixing speed
            targetPot.setAttribute('data-mixing-speed', ingredientMixingSpeed);
        } else if (potMixingSpeed !== ingredientMixingSpeed.toString()) {
            // Mixing speeds don't match - show error
            this.showError(targetPot, `Mengsnelheid komt niet overeen! Deze pot vereist snelheid ${potMixingSpeed}`);
            return;
        }
        
        // Use the controller's method to handle dropping the ingredient
        this.controller.dropIngredient(draggedIndex, potIndexNum);
        
        // Update the visual representation
        this.updatePotContents(targetPot, targetPotIndex);
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
    
    // Helper methods
    getStructureClass(structure) {
        switch (structure) {
            case "korrel": return 'grain';
            case "grove korrel": return 'rough-grain';
            case "glad": return 'smooth';
            case "slijmerig": return 'slimey';
            default: return '';
        }
    }
    
    getStructureText(structure) {
        switch (structure) {
            case "korrel": return 'K';
            case "grove korrel": return 'GK';
            case "glad": return 'G';
            case "slijmerig": return 'S';
            default: return '';
        }
    }
    
    getLineHeight(structure) {
        switch (structure) {
            case "korrel": return '20px';
            case "grove korrel": return '60px';
            case "glad": return '50px';
            case "slijmerig": return '30px';
            default: return '50px';
        }
    }
    
    showError(targetElement, errorMessage) {
        // Remove any existing error messages
        this.removeErrorMessages();
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mixing-pot-error';
        errorDiv.textContent = errorMessage;
        
        // Add error to target element
        targetElement.appendChild(errorDiv);
        
        // Remove error after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode === targetElement) {
                targetElement.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    removeErrorMessages() {
        const errors = document.querySelectorAll('.mixing-pot-error');
        errors.forEach(error => error.remove());
    }

    showValidationErrors(errors, form) {
        // Remove existing error messages
        const existingErrors = form.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        // Display new error messages
        errors.forEach(error => {
            const field = form.querySelector(`#${error.field}`);
            if (field) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = error.message;
                field.parentNode.appendChild(errorDiv);
            }
        });
    }
    
    // Update weather text with data provided by controller
    updateWeatherText(temperature, isPrecipitation) {
        const weatherText = document.getElementById("weatherText");
        if (weatherText) {
            if (temperature === null || temperature === undefined) {
                weatherText.textContent = "Temperatuur: Laden... | Neerslag: Laden...";
            } else {
                const temp = temperature.toFixed(1);
                weatherText.textContent = `Temperatuur: ${temp}°C | Neerslag: ${isPrecipitation ? "Ja" : "Nee"}`;
            }
        }
    }
    
    // Convert hex color to HSL format
    hexToHSL(hex) {
        // Remove the # if present
        hex = hex.replace(/^#/, '');
        
        // Parse the hex values
        let r = parseInt(hex.slice(0, 2), 16) / 255;
        let g = parseInt(hex.slice(2, 4), 16) / 255;
        let b = parseInt(hex.slice(4, 6), 16) / 255;
        
        // Find the min and max values to calculate the lightness
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            // Achromatic (grey)
            h = 0;
            s = 0;
        } else {
            // Calculate hue and saturation
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h = Math.round(h * 60);
        }
        
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    // Convert HSL color to hex format
    hslToHex(hsl) {
        // Parse the HSL values
        const matches = hsl.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
        
        if (!matches) return '#000000';
        
        let h = parseInt(matches[1]) / 360;
        let s = parseInt(matches[2]) / 100;
        let l = parseInt(matches[3]) / 100;
        
        // No saturation means it's a shade of grey
        if (s === 0) {
            let val = Math.round(l * 255);
            return `#${val.toString(16).padStart(2, '0').repeat(3)}`;
        }
        
        // Helper function for the conversion
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
        const g = Math.round(hue2rgb(p, q, h) * 255);
        const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
        
        const toHex = (val) => {
            const hex = val.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}