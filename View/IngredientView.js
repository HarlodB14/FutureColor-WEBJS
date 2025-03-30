import CreateInput from "../Helpers/CreateInput.js";
import Structures from "../Enums/Structures.js";

export default class IngredientView {
    constructor(controller, mixingPotContents) {
        this.controller = controller;
        this.mixingPotContents = mixingPotContents;
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
        form.appendChild(createInput.createInputField('Kleur (HSL)', 'color', 'text'));

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
            
            // Set background color
            ingredientDiv.style.backgroundColor = ingredient.color;
            ingredientDiv.style.lineHeight = this.getLineHeight(ingredient.structure);
            
            ingredientDiv.draggable = true;
            ingredientDiv.setAttribute('data-index', index);
            ingredientDiv.setAttribute('data-mixing-speed', ingredient.mixingSpeed);

            // Add hover event listeners for tooltip
            ingredientDiv.addEventListener("mouseenter", this.showMixingSpeedTooltip);
            ingredientDiv.addEventListener("mouseleave", this.hideMixingSpeedTooltip);

            ingredientDiv.addEventListener("dragstart", (e) => this.onDragStart(e));
            ingredientDiv.addEventListener("dragover", (e) => this.onDragOver(e));
            ingredientDiv.addEventListener("drop", (e) => this.onDrop(e));

            ingredientDiv.innerText = this.getStructureText(ingredient.structure);
            container.appendChild(ingredientDiv);
        });
    }

    getStructureClass(structure) {
        switch (structure) {
            case Structures.GRAIN: return 'grain';
            case Structures.ROUGH_GRAIN: return 'rough-grain';
            case Structures.SMOOTH: return 'smooth';
            case Structures.SLIMEY: return 'slimey';
            default: return '';
        }
    }
    
    getStructureText(structure) {
        switch (structure) {
            case Structures.GRAIN: return 'K';
            case Structures.ROUGH_GRAIN: return 'GK';
            case Structures.SMOOTH: return 'G';
            case Structures.SLIMEY: return 'S';
            default: return '';
        }
    }
    
    getLineHeight(structure) {
        switch (structure) {
            case Structures.GRAIN: return '20px';
            case Structures.ROUGH_GRAIN: return '60px';
            case Structures.SMOOTH: return '50px';
            case Structures.SLIMEY: return '30px';
            default: return '50px';
        }
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

        // Check for pots specifically in mixingPotsContainer
        mixingPots.forEach((pot, index) => {
            // Check if a pot with this specific index already exists in the mixing pots container
            let potSelector = `#mixingPotsContainer > [data-index="${index}"]`;
            if (document.querySelector(potSelector)) {
                return; // Skip existing pots
            }

            let potDiv = document.createElement("div");
            potDiv.className = "mixing-pot";

            potDiv.draggable = true;
            // Bind this context properly for mouseDown
            potDiv.addEventListener("mousedown", (e) => this.mouseDown(e));
            potDiv.setAttribute("data-index", index);
            
            // Store the mixing speed for this pot (initially null)
            potDiv.setAttribute("data-mixing-speed", "");

            potDiv.addEventListener("dragstart", (e) => this.onDragStart(e));
            potDiv.addEventListener("dragover", (e) => this.onDragOver(e));
            potDiv.addEventListener("drop", (e) => this.onDrop(e));

            container.appendChild(potDiv);

            // Ensure existing ingredients stay in the correct pot
            this.updatePotContents(potDiv, index);
        });
    }

    updatePotContents(potDiv, potIndex) {
        potDiv.innerHTML = "";

        const ingredients = this.mixingPotContents.get(potIndex) || [];
        const maxPerRow = 3;
        const spacing = 4;
        const ingredientSize = 30; // Adjust based on your design

        // max aantal rijen pakken
        const numRows = Math.ceil(ingredients.length / maxPerRow);
        const potHeight = numRows * (ingredientSize + spacing) + 20; // Adding padding

        // potgroote dynamisch aanpassen
        potDiv.style.height = `${Math.max(100, potHeight)}px`; // Minimum height of 100px
        
        // Update pot's mixing speed attribute from first ingredient (if exists)
        if (ingredients.length > 0) {
            potDiv.setAttribute('data-mixing-speed', ingredients[0].mixingSpeed);
            
            // Create a small label showing the pot's mixing speed
            const speedLabel = document.createElement('div');
            speedLabel.className = 'pot-mixing-speed';
            speedLabel.textContent = `Speed: ${ingredients[0].mixingSpeed}`;
            
            potDiv.appendChild(speedLabel);
        } else {
            // Reset mixing speed if no ingredients
            potDiv.setAttribute('data-mixing-speed', '');
        }

        ingredients.forEach((ingredient, index) => {
            let ingredientDiv = document.createElement("div");
            ingredientDiv.className = 'ingredient';
            ingredientDiv.classList.add(this.getStructureClass(ingredient.structure));
            
            // Set styles not in CSS
            ingredientDiv.style.width = `${ingredientSize}px`;
            ingredientDiv.style.height = `${ingredientSize}px`;
            ingredientDiv.style.backgroundColor = ingredient.color;
            ingredientDiv.style.margin = `${spacing / 2}px`;
            
            ingredientDiv.innerText = this.getStructureText(ingredient.structure);
            ingredientDiv.setAttribute('data-mixing-speed', ingredient.mixingSpeed);
            
            // Add hover event listeners to pot ingredients as well
            ingredientDiv.addEventListener("mouseenter", this.showMixingSpeedTooltip);
            ingredientDiv.addEventListener("mouseleave", this.hideMixingSpeedTooltip);
            
            potDiv.appendChild(ingredientDiv);
        });
    }

    // New method to show tooltip
    showMixingSpeedTooltip(e) {
        const mixingSpeed = e.target.getAttribute('data-mixing-speed');
        
        let tooltip = document.createElement('div');
        tooltip.className = 'mixing-speed-tooltip';
        tooltip.textContent = `mixingspeed: ${mixingSpeed}`;
        
        e.target.appendChild(tooltip);
    }

    // New method to hide tooltip
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
        if (!this.mixingPotContents.has(targetPotIndex)) {
            this.mixingPotContents.set(targetPotIndex, []);
        }
        const potContents = this.mixingPotContents.get(targetPotIndex);
        
        // We've removed the ingredient limit check here

        // Get the dragged ingredient
        const ingredient = this.controller.getIngredientByIndex(draggedIndex);
        if (!ingredient) return;
        
        // Get current pot mixing speed (if any ingredients exist)
        const potMixingSpeed = targetPot.getAttribute('data-mixing-speed');
        const ingredientMixingSpeed = ingredient.mixingSpeed;
        
        // Check if this is the first ingredient or if mixing speeds match
        if (potContents.length === 0) {
            // First ingredient - set the pot's mixing speed
            targetPot.setAttribute('data-mixing-speed', ingredientMixingSpeed);
        } else if (potMixingSpeed !== ingredientMixingSpeed.toString()) {
            // Mixing speeds don't match - show error
            this.showError(targetPot, `Mixing speed mismatch! This pot requires speed ${potMixingSpeed}`);
            return;
        }
        
        // If we got here, ingredient can be added to pot
        potContents.push(ingredient);
        this.controller.removeIngredient(draggedIndex);

        this.updatePotContents(targetPot, targetPotIndex);
        this.controller.view.drawIngredients(this.controller.getIngredients());
    }
    
    // Method to show error message near a pot
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
    
    // Remove all error messages
    removeErrorMessages() {
        const errors = document.querySelectorAll('.mixing-pot-error');
        errors.forEach(error => error.remove());
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
}