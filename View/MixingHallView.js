import IngredientView from "./IngredientView.js";
import MachineView from "./MachineView.js";
import ButtonView from "./ButtonView.js";

export default class MixingHallView {
    constructor(controller) {
        this.controller = controller;
        this.mixingPotContents = new Map();
        
        // Initialize sub-views
        this.ingredientView = new IngredientView(controller, this.mixingPotContents);
        this.machineView = new MachineView(controller);
        this.buttonView = new ButtonView(controller);
        
        // Setup the layout
        this.setupLayout();
        
        // Draw all components
        this.ingredientView.drawIngredientForm();
        this.ingredientView.drawMixingPots(this.controller.mixingPots);
        this.buttonView.drawButtonContainer();
        
        // Draw machines for the active hall
        this.drawMixingMachines(this.controller.getActiveMixingHall().mixMachines);
        
        // Set up the hall switcher
        this.setupHallSwitcher();
        
        // Create weather warning container
        this.setupWeatherWarningContainer();
    }
    
    // Set up a container for weather condition warnings
    setupWeatherWarningContainer() {
        const mainContainer = document.getElementById("mainContainer");
        if (!mainContainer) return;
        
        // Create warning container
        const warningContainer = document.createElement('div');
        warningContainer.id = 'weatherWarningContainer';
        warningContainer.style.position = 'fixed';
        warningContainer.style.top = '10px';
        warningContainer.style.right = '10px';
        warningContainer.style.maxWidth = '300px';
        warningContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        warningContainer.style.color = 'white';
        warningContainer.style.padding = '10px';
        warningContainer.style.borderRadius = '5px';
        warningContainer.style.zIndex = '1000';
        warningContainer.style.display = 'none';
        warningContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        warningContainer.style.fontWeight = 'bold';
        
        mainContainer.appendChild(warningContainer);
    }
    
    // Show high temperature warning
    showHighTemperatureWarning() {
        const warningContainer = document.getElementById('weatherWarningContainer');
        if (!warningContainer) return;
        
        warningContainer.textContent = 'WAARSCHUWING: Door de hoge temperatuur kan slechts één mixmachine tegelijk worden gebruikt.';
        warningContainer.style.display = 'block';
    }
    
    // Hide high temperature warning
    hideHighTemperatureWarning() {
        const warningContainer = document.getElementById('weatherWarningContainer');
        if (!warningContainer) return;
        
        warningContainer.style.display = 'none';
    }
    
    // Show temperature restriction error message
    showTemperatureRestrictionError(message) {
        // Clear any existing error first
        this.clearTemperatureRestrictionError();
        
        const machineContainer = document.getElementById('mixingMachinesContainer');
        if (!machineContainer) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.id = 'temperatureRestrictionError';
        errorDiv.textContent = message;
        errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.margin = '10px 0';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.fontWeight = 'bold';
        
        // Insert at the top of the container
        machineContainer.insertBefore(errorDiv, machineContainer.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => this.clearTemperatureRestrictionError(), 5000);
    }
    
    // Clear temperature restriction error
    clearTemperatureRestrictionError() {
        const errorDiv = document.getElementById('temperatureRestrictionError');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    // Set up the hall switcher UI
    setupHallSwitcher() {
        const machineAreaContainer = document.getElementById("machineAreaContainer");
        if (!machineAreaContainer) return;
        
        // Create the switcher container
        const switcherContainer = document.createElement('div');
        switcherContainer.className = 'hall-switcher-container';
        switcherContainer.style.marginBottom = '20px';
        switcherContainer.style.textAlign = 'center';
        
        // Create the hall indicator
        const hallIndicator = document.createElement('div');
        hallIndicator.id = 'hallIndicator';
        hallIndicator.textContent = `Menghal #${this.controller.activeHallIndex + 1}`;
        hallIndicator.style.fontWeight = 'bold';
        hallIndicator.style.marginBottom = '10px';
        
        // Create the switch button
        const switchButton = document.createElement('button');
        switchButton.textContent = 'Wissel Menghal';
        switchButton.className = 'action-button';
        switchButton.style.width = '180px';
        switchButton.addEventListener('click', () => {
            const newIndex = this.controller.switchMixingHall();
            hallIndicator.textContent = `Menghal #${newIndex + 1}`;
        });
        
        // Add the elements to the container
        switcherContainer.appendChild(hallIndicator);
        switcherContainer.appendChild(switchButton);
        
        // Add the container to the machine area at the top
        machineAreaContainer.insertBefore(switcherContainer, machineAreaContainer.firstChild);
    }
    
    // Update the active hall indicator
    updateActiveHall(hallIndex) {
        const hallIndicator = document.getElementById('hallIndicator');
        if (hallIndicator) {
            hallIndicator.textContent = `Menghal #${hallIndex + 1}`;
        }
    }
    
    // Update weather text with data provided by controller
    updateWeatherText(temperature, isPrecipitation) {
        this.ingredientView.updateWeatherText(temperature, isPrecipitation);
        
        // Update any weather-dependent UI elements
        if (temperature > 35) {
            this.showHighTemperatureWarning();
        } else {
            this.hideHighTemperatureWarning();
        }
        
        // Update weather effects display
        this.updateWeatherEffectsDisplay(temperature, isPrecipitation);
    }
    
    // Update the display showing weather effects on mixing time
    updateWeatherEffectsDisplay(temperature, isPrecipitation) {
        // Find or create the weather effects container
        let effectsContainer = document.getElementById('weatherEffectsContainer');
        
        if (!effectsContainer) {
            // Create new container if it doesn't exist
            effectsContainer = document.createElement('div');
            effectsContainer.id = 'weatherEffectsContainer';
            effectsContainer.style.marginTop = '5px';
            effectsContainer.style.fontSize = '11px';
            effectsContainer.style.color = '#007BFF';
            effectsContainer.style.fontWeight = 'bold';
            
            // Add it after the weather text
            const weatherText = document.getElementById('weatherText');
            if (weatherText) {
                weatherText.parentNode.insertBefore(effectsContainer, weatherText.nextSibling);
            }
        }
        
        // Build the effects message
        let effectsMessage = 'Effecten: ';
        let hasEffects = false;
        
        if (isPrecipitation) {
            effectsMessage += 'Neerslag (+10% mengtijd)';
            hasEffects = true;
        }
        
        if (temperature < 10) {
            if (hasEffects) effectsMessage += ', ';
            effectsMessage += 'Lage temperatuur (+15% mengtijd)';
            hasEffects = true;
        }
        
        if (temperature > 35) {
            if (hasEffects) effectsMessage += ', ';
            effectsMessage += 'Hoge temperatuur (slechts één machine toegestaan)';
            hasEffects = true;
        }
        
        if (!hasEffects) {
            effectsMessage += 'Geen';
        }
        
        effectsContainer.textContent = effectsMessage;
    }

    setupLayout() {
        // Create main container that will hold all areas
        let mainContainer = document.createElement("div");
        mainContainer.id = "mainContainer";
        document.body.appendChild(mainContainer);

        // Create left area for mixing pots and ingredients (40%)
        let leftArea = document.createElement("div");
        leftArea.id = "mixingAreaContainer";
        mainContainer.appendChild(leftArea);

        // Create middle area for mixing machines (20%)
        let middleArea = document.createElement("div");
        middleArea.id = "machineAreaContainer";
        mainContainer.appendChild(middleArea);

        // Create right area for buttons and color grid (40%)
        let rightArea = document.createElement("div");
        rightArea.id = "rightContainer";
        mainContainer.appendChild(rightArea);
    }
    
    // Public methods to update the view
    drawMixingPots(mixingPots) {
        this.ingredientView.drawMixingPots(mixingPots);
    }
    
    drawMixingMachines(mixingMachines) {
        this.machineView.drawMixingMachines(mixingMachines);
    }
    
    drawIngredients(ingredients) {
        this.ingredientView.drawIngredients(ingredients);
    }
    
    showValidationErrors(errors, form) {
        this.ingredientView.showValidationErrors(errors, form);
    }
}