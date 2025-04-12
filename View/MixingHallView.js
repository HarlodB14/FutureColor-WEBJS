import IngredientView from "./IngredientView.js";
import MachineView from "./MachineView.js";
import ButtonView from "./ButtonView.js";

export default class MixingHallView {
    constructor(controller) {
        this.controller = controller;
        this.mixingPotContents = new Map();
        
        // Track whether a city update is in progress
        this.cityUpdateInProgress = false;
        // Store the most recent city name input by the user
        this.pendingCityName = null;
        
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
        
        // Add city input field
        this.setupCityInput();
    }
    
    // Set up the city input field for weather
    setupCityInput() {
        // Find the weatherText element to place the city input nearby
        const weatherText = document.getElementById('weatherText');
        if (!weatherText) return;
        
        // Create a container for the city input
        const cityContainer = document.createElement('div');
        cityContainer.id = 'cityInputContainer';
        
        // Create a label for the city input
        const cityLabel = document.createElement('label');
        cityLabel.textContent = 'Stad:';
        cityLabel.htmlFor = 'cityInput';
        
        // Create the city input field
        const cityInput = document.createElement('input');
        cityInput.type = 'text';
        cityInput.id = 'cityInput';
        cityInput.value = this.controller.weatherSystem.cityName || 'Halifax'; // Default value from WeatherSystem
        
        // Create a button to apply the city change
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Toepassen';
        applyButton.type = 'button'; // Explicitly set type to button to prevent form submission
        
        // Add event listener to apply button - FIXED with stopPropagation
        applyButton.addEventListener('click', (e) => {
            // Prevent any form submission or event bubbling
            e.preventDefault();
            e.stopPropagation();
            
            // Get the input value
            const cityName = cityInput.value.trim();
            if (cityName) {
                // Save the current city value
                this.pendingCityName = cityName;
                this.updateCity(cityName);
            }
        });
        
        // Add event listener for Enter key on input - FIXED with stopPropagation
        cityInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // Prevent any form submission or event bubbling
                e.preventDefault();
                e.stopPropagation();
                
                // Get the input value
                const cityName = cityInput.value.trim();
                if (cityName) {
                    // Save the current city value
                    this.pendingCityName = cityName;
                    this.updateCity(cityName);
                }
                
                return false; // Additional safeguard against event propagation
            }
        });
        
        // Add elements to the container
        cityContainer.appendChild(cityLabel);
        cityContainer.appendChild(cityInput);
        cityContainer.appendChild(applyButton);
        
        // Insert the city container after the weather text, but OUTSIDE THE FORM
        // Find the parent form that contains weatherText
        const parentForm = weatherText.closest('form');
        if (parentForm) {
            // Insert after the form to prevent form validation issues
            parentForm.parentNode.insertBefore(cityContainer, parentForm.nextSibling);
        } else {
            // Fallback: Insert after weather text
            weatherText.parentNode.insertBefore(cityContainer, weatherText.nextSibling);
        }
        
        // Add a status message element
        const statusMessage = document.createElement('div');
        statusMessage.id = 'cityUpdateStatus';
        statusMessage.style.display = 'none';
        
        // Place the status message after the city container
        if (parentForm) {
            parentForm.parentNode.insertBefore(statusMessage, cityContainer.nextSibling);
        } else {
            weatherText.parentNode.insertBefore(statusMessage, cityContainer.nextSibling);
        }
    }
    
    // Update the city for weather data
    updateCity(cityName) {
        if (!cityName) return;
        
        // Mark update as in progress
        this.cityUpdateInProgress = true;
        
        const statusMessage = document.getElementById('cityUpdateStatus');
        if (statusMessage) {
            statusMessage.textContent = `Weer bijwerken voor ${cityName}...`;
            statusMessage.style.display = 'block';
            // Remove any existing classes
            statusMessage.className = '';
        }
        
        // Call the WeatherSystem to update the city
        this.controller.weatherSystem.setCity(cityName)
            .then(weatherData => {
                // Update weather information
                this.updateWeatherText(weatherData.temperature, weatherData.isPrecipitation);
                
                if (statusMessage) {
                    statusMessage.textContent = `Weer bijgewerkt voor ${cityName}`;
                    statusMessage.classList.add('success');
                    
                    // Hide the message after 3 seconds
                    setTimeout(() => {
                        statusMessage.style.display = 'none';
                    }, 3000);
                }
                
                // Update is complete
                this.cityUpdateInProgress = false;
                // Don't clear pendingCityName so it's remembered for future updates
            })
            .catch(error => {
                console.error('Fout bij het bijwerken van het weer:', error);
                
                if (statusMessage) {
                    statusMessage.textContent = `Fout bij het ophalen van weer voor ${cityName}`;
                    statusMessage.classList.add('error');
                    
                    // Hide the message after 3 seconds
                    setTimeout(() => {
                        statusMessage.style.display = 'none';
                    }, 3000);
                }
                
                // Update is complete
                this.cityUpdateInProgress = false;
                // Don't clear pendingCityName so the user's input is remembered
            });
    }
    
    // Set up a container for weather condition warnings
    setupWeatherWarningContainer() {
        const mainContainer = document.getElementById("mainContainer");
        if (!mainContainer) return;
        
        // Create warning container
        const warningContainer = document.createElement('div');
        warningContainer.id = 'weatherWarningContainer';
        
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
        
        // Create the hall indicator
        const hallIndicator = document.createElement('div');
        hallIndicator.id = 'hallIndicator';
        hallIndicator.textContent = `Menghal #${this.controller.activeHallIndex + 1}`;
        
        // Create the switch button
        const switchButton = document.createElement('button');
        switchButton.textContent = 'Wissel Menghal';
        switchButton.className = 'action-button hall-switcher-button';
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
        
        // FIXED: Only update the city input if we're not in the middle of a user update
        // and we don't have a pending city name
        const cityInput = document.getElementById('cityInput');
        if (cityInput) {
            if (this.cityUpdateInProgress && this.pendingCityName) {
                // If we are in the middle of an update, keep the user's input
                cityInput.value = this.pendingCityName;
            } else if (!this.cityUpdateInProgress && !this.pendingCityName) {
                // Only reset if we're not in an update AND the user hasn't set a pending name
                if (this.controller.weatherSystem.cityName) {
                    cityInput.value = this.controller.weatherSystem.cityName;
                }
            } else if (this.pendingCityName) {
                // If user has set a pending name but we're not in an update,
                // still keep their input
                cityInput.value = this.pendingCityName;
            }
        }
    }
    
    // Update city input to match current city in WeatherSystem
    // FIXED: Modified to respect pendingCityName
    updateCityInput() {
        const cityInput = document.getElementById('cityInput');
        
        if (cityInput) {
            if (this.pendingCityName) {
                // If there's a pending city name from user input, use that
                cityInput.value = this.pendingCityName;
            } else if (this.controller.weatherSystem.cityName) {
                // Otherwise use the system's city name
                cityInput.value = this.controller.weatherSystem.cityName;
            }
        }
    }
    
    // Update the display showing weather effects on mixing time
    updateWeatherEffectsDisplay(temperature, isPrecipitation) {
        // Find or create the weather effects container
        let effectsContainer = document.getElementById('weatherEffectsContainer');
        
        if (!effectsContainer) {
            // Create new container if it doesn't exist
            effectsContainer = document.createElement('div');
            effectsContainer.id = 'weatherEffectsContainer';
            
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