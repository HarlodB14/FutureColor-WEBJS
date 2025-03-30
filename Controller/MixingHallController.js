import Ingredient from "../Model/Ingredient.js";
import MixingHall from "../Model/MixingHall.js";
import MixingPot from "../Model/MixingPot.js";
import MixingHallView from "../View/MixingHallView.js";
import FormValidator from "../Helpers/FormValidator.js";
import WeatherSystem from "../Model/WeatherSystem.js";
import MixingMachineStatus from "../Enums/MixingMachineStatus.js";
import MixingPotStatus from "../Enums/MixingPotStatus.js";
import MixingHallStatus from "../Enums/MixingHallStatus.js";

export default class MixingHallController {
    constructor() {
        // Create two mixing halls
        this.mixingHalls = [
            new MixingHall(),
            new MixingHall()
        ];
        
        // Set initial status for both halls
        this.mixingHalls[0].setStatus(MixingHallStatus.EMPTY);
        this.mixingHalls[1].setStatus(MixingHallStatus.EMPTY);
        
        // Set IDs for the halls
        this.mixingHalls[0].setId(0);
        this.mixingHalls[1].setId(1);
        
        // Track which hall is currently active
        this.activeHallIndex = 0;
        
        this.mixingPots = []; // Now managed at controller level
        this.ingredients = []; // Ingredients also managed at controller level
        this.weatherSystem = new WeatherSystem();
        
        // Current weather conditions
        this.currentTemperature = 20; // Default temperature
        this.isPrecipitation = false; // Default precipitation status
        
        this.view = new MixingHallView(this);
        
        // Set up a timer to check for weather updates every 10 seconds
        setInterval(() => this.updateWeatherDisplay(), 10000);
        
        // Initial weather display after a short delay to allow for API fetch
        setTimeout(() => this.updateWeatherDisplay(), 1000);

        // Mouse actions binding
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
    }
    
    // Get the currently active mixing hall
    getActiveMixingHall() {
        return this.mixingHalls[this.activeHallIndex];
    }
    
    // Switch to the other mixing hall
    switchMixingHall() {
        // Toggle the active hall index (0 -> 1, 1 -> 0)
        this.activeHallIndex = this.activeHallIndex === 0 ? 1 : 0;
        
        // Update the view to show the new active hall
        this.view.updateActiveHall(this.activeHallIndex);
        
        // Redraw the mixing machines for the active hall
        this.view.drawMixingMachines(this.getActiveMixingHall().mixMachines);
        
        return this.activeHallIndex;
    }
    
    // Get a specific mixing hall by index
    getMixingHall(index) {
        if (index === 0 || index === 1) {
            return this.mixingHalls[index];
        }
        return null;
    }
    
    // Check if high temperature restriction is in effect
    isHighTemperatureRestrictionActive() {
        return this.currentTemperature > 35;
    }
    
    // Check if any machine is currently mixing in a hall
    isAnyMachineMixing(hall) {
        return hall.mixMachines.some(machine => machine.status === MixingMachineStatus.MIXING);
    }
    
    // Calculate the actual mixing time based on weather conditions
    calculateAdjustedMixingTime(baseMixingTime) {
        let adjustedTime = baseMixingTime;
        
        // Add 10% if it's raining or snowing
        if (this.isPrecipitation) {
            adjustedTime *= 1.1; // 10% increase
        }
        
        // Add 15% if temperature is below 10 degrees
        if (this.currentTemperature < 10) {
            adjustedTime *= 1.15; // 15% increase
        }
        
        return Math.round(adjustedTime);
    }
    
    // Update the weather display in the view with current data
    updateWeatherDisplay() {
        try {
            const temperature = this.weatherSystem.getTemperature();
            const isPrecipitation = this.weatherSystem.hasPrecipitation();
            
            // Store current conditions
            this.currentTemperature = temperature;
            this.isPrecipitation = isPrecipitation;
            
            // Update the view with the latest weather data
            this.view.updateWeatherText(temperature, isPrecipitation);
            
            // Update the high temperature warning if needed
            if (this.isHighTemperatureRestrictionActive()) {
                this.view.showHighTemperatureWarning();
            } else {
                this.view.hideHighTemperatureWarning();
            }
        } catch (error) {
            console.error("Fout bij het bijwerken van het weerbericht:", error);
            // Update with default values to prevent being stuck on loading
            this.currentTemperature = 20;
            this.isPrecipitation = false;
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
        let id = this.mixingPots.length;
        
        // Create a new MixingPot instance
        let mixingPot = new MixingPot();
        mixingPot.setId(id);
        mixingPot.setStatus(MixingPotStatus.EMPTY);
        
        // Add to the controller's mixingPots array
        this.mixingPots.push(mixingPot);
        
        // For debugging
        console.log("Nieuwe pot aangemaakt:", mixingPot);
        console.log("Alle potten na aanmaak:", this.mixingPots);
        
        // Update the view
        this.view.drawMixingPots(this.mixingPots);
    }

    createMixingMachine() {
        const activeHall = this.getActiveMixingHall();
        let id = activeHall.mixMachines.length;
        let mixMachine = { 
            id, 
            pot_contents: [], 
            mixingSpeed: 0, 
            mixingTime: 0,
            status: MixingMachineStatus.EMPTY
        };
        activeHall.addMixingMachine(mixMachine);
        
        // Update hall status if it was empty
        if (activeHall.getStatus() === MixingHallStatus.EMPTY) {
            activeHall.setStatus(MixingHallStatus.RUNNING);
        }
        
        this.view.drawMixingMachines(activeHall.mixMachines);
    }
    
    // Method to handle removing a mixing machine
    removeMixingMachine(index) {
        const activeHall = this.getActiveMixingHall();
        // Check if the machine exists
        if (activeHall.mixMachines[index]) {
            // Remove the machine from the model
            activeHall.mixMachines.splice(index, 1);
            
            // Update IDs for all remaining machines to match their array index
            activeHall.mixMachines.forEach((machine, i) => {
                machine.id = i;
            });
            
            // Update hall status if it was the last machine
            if (activeHall.mixMachines.length === 0) {
                activeHall.setStatus(MixingHallStatus.EMPTY);
            }
            
            // Redraw all machines to update indexes
            this.view.drawMixingMachines(activeHall.mixMachines);
            
            console.log(`Mixmachine met index ${index} verwijderd`);
            console.log("Overgebleven machines:", activeHall.mixMachines);
        } else {
            console.error(`Machine met index ${index} niet gevonden`);
        }
    }
    
    // Method to handle removing a mixing pot
    removeMixingPot(index) {
        // Check if the pot exists
        if (this.mixingPots[index]) {
            // Remove the pot from the controller
            this.mixingPots.splice(index, 1);
            
            // Update IDs for all remaining pots to match their array index
            this.mixingPots.forEach((pot, i) => {
                pot.setId(i);
            });
            
            // Redraw all pots to update indexes
            this.view.drawMixingPots(this.mixingPots);
            
            console.log(`Mengpot met index ${index} verwijderd`);
            console.log("Overgebleven potten:", this.mixingPots);
        } else {
            console.error(`Pot met index ${index} niet gevonden`);
        }
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
            this.ingredients.push(ingredient);
            this.view.drawIngredients(this.ingredients);
        } else {
            this.view.showValidationErrors(result.errors, form);
        }
    }

    dropIngredient(ingredientIndex, potIndex) {
        const ingredient = this.ingredients.splice(ingredientIndex, 1)[0];
        
        // Ensure the pot has a contents array
        if (!this.mixingPots[potIndex].contents) {
            this.mixingPots[potIndex].contents = [];
        }
        
        this.mixingPots[potIndex].addIngredient(ingredient);
        
        this.view.drawMixingPots(this.mixingPots);
        this.view.drawIngredients(this.ingredients);
    }

    removeIngredient(index) {
        if (index >= 0 && index < this.ingredients.length) {
            this.ingredients.splice(index, 1);
        }
        this.view.drawIngredients(this.ingredients);
    }

    getIngredientByIndex(index) {
        return this.ingredients[index];
    }

    getIngredients() {
        return this.ingredients;
    }
    
    // Method to handle adding a pot to a machine
    addPotToMachine(potIndex, machineIndex) {
        console.log("Pot toevoegen aan machine, potIndex:", potIndex, "machineIndex:", machineIndex);
        
        // Convert potIndex to a number if it's a string
        const potIndexNum = parseInt(potIndex, 10);
        
        // Get the mixing pot
        const pot = this.mixingPots[potIndexNum];
        
        if (!pot) {
            console.error(`Pot met index ${potIndexNum} niet gevonden`);
            return false;
        }
        
        // Log pot contents to debug
        console.log("Pot inhoud:", pot);
        console.log("Pot inhoud:", pot.contents);
        
        // Get the active mixing hall
        const activeHall = this.getActiveMixingHall();
        
        // Check high temperature restriction - If temperature is above 35 degrees, 
        // only allow one machine to be mixing at a time
        if (this.isHighTemperatureRestrictionActive()) {
            // Check if any machine is already mixing
            if (this.isAnyMachineMixing(activeHall)) {
                console.warn("Hoge temperatuur beperking: Kan niet meerdere machines gebruiken");
                this.view.showTemperatureRestrictionError(
                    "Te warm! Er kan slechts één mixmachine tegelijk worden gebruikt."
                );
                return false;
            }
        }
        
        // Get the mixing machine
        const machine = activeHall.mixMachines[machineIndex];
        
        if (!machine) {
            console.error(`Machine met index ${machineIndex} niet gevonden`);
            return false;
        }
        
        // Check if the pot has any contents
        if (!pot.contents || pot.contents.length === 0) {
            console.warn("Kan geen lege pot aan machine toevoegen");
            return false;
        }
        
        // Check if machine already has contents
        if (machine.pot_contents && machine.pot_contents.length > 0) {
            console.warn("Machine heeft al een pot");
            return false;
        }
        
        // Move the pot contents to the machine
        machine.pot_contents = [...pot.contents];
        
        // Set machine properties based on the contents
        if (pot.contents.length > 0) {
            // Use first ingredient for mixing properties
            const firstIngredient = pot.contents[0];
            machine.mixingSpeed = firstIngredient.mixingSpeed;
            
            // Find the longest mixing time
            let longestTime = 0;
            pot.contents.forEach(ingredient => {
                const time = parseInt(ingredient.amountOfMixingTime, 10);
                if (time > longestTime) {
                    longestTime = time;
                }
            });
            
            // Apply weather-based adjustments to mixing time
            machine.mixingTime = this.calculateAdjustedMixingTime(longestTime);
            
            // Log the adjustment
            console.log(`Originele mengtijd: ${longestTime}, Aangepast voor weer: ${machine.mixingTime}`);
        }
        
        // Set the machine status to mixing
        machine.status = MixingMachineStatus.MIXING;
        
        // Store the ID of the removed pot for reference
        const potId = pot.getId();
        
        // Remove the pot from the controller's mixingPots array
        this.mixingPots.splice(potIndexNum, 1);
        
        // Update IDs for all remaining pots to match their array index
        this.mixingPots.forEach((remainingPot, index) => {
            remainingPot.setId(index);
        });
        
        console.log("Machine na toevoegen pot:", machine);
        console.log("Overgebleven potten:", this.mixingPots);
        
        return true;
    }
}