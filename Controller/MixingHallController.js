import Ingredient from "../Model/Ingredient.js";
import MixingHall from "../Model/MixingHall.js";
import MixingHallView from "../View/MixingHallView.js";
import FormValidator from "../Helpers/FormValidator.js";
import WeatherSystem from "../Model/WeatherSystem.js";
import MixingMachineStatus from "../Enums/MixingMachineStatus.js";

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
        
        // Create a new pot with an empty ingredients array
        let mixingPot = { 
            id: id, 
            ingredients: [] // Ensure this is an empty array
        };
        
        // Add to the mixing hall
        this.mixingHall.mixingPots.push(mixingPot);
        
        // For debugging
        console.log("Created new pot:", mixingPot);
        console.log("All pots after creation:", this.mixingHall.mixingPots);
        
        // Update the view
        this.view.drawMixingPots(this.mixingHall.mixingPots);
    }

    createMixingMachine() {
        let id = this.mixingHall.mixMachines.length;
        let mixMachine = { 
            id, 
            pot_contents: [], 
            mixingSpeed: 0, 
            mixingTime: 0,
            status: MixingMachineStatus.EMPTY
        };
        this.mixingHall.mixMachines.push(mixMachine);
        this.view.drawMixingMachines(this.mixingHall.mixMachines);
    }
    
    // Method to handle removing a mixing machine
    removeMixingMachine(index) {
        // Check if the machine exists
        if (this.mixingHall.mixMachines[index]) {
            // Remove the machine from the model
            this.mixingHall.mixMachines.splice(index, 1);
            
            // Update IDs for all remaining machines to match their array index
            this.mixingHall.mixMachines.forEach((machine, i) => {
                machine.id = i;
            });
            
            // Redraw all machines to update indexes
            this.view.drawMixingMachines(this.mixingHall.mixMachines);
            
            console.log(`Removed mixing machine at index ${index}`);
            console.log("Remaining machines:", this.mixingHall.mixMachines);
        } else {
            console.error(`Machine with index ${index} not found`);
        }
    }
    
    // Method to handle removing a mixing pot
    removeMixingPot(index) {
        // Check if the pot exists
        if (this.mixingHall.mixingPots[index]) {
            // Remove the pot from the model
            this.mixingHall.mixingPots.splice(index, 1);
            
            // Update IDs for all remaining pots to match their array index
            this.mixingHall.mixingPots.forEach((pot, i) => {
                pot.id = i;
            });
            
            // Redraw all pots to update indexes
            this.view.drawMixingPots(this.mixingHall.mixingPots);
            
            console.log(`Removed mixing pot at index ${index}`);
            console.log("Remaining pots:", this.mixingHall.mixingPots);
        } else {
            console.error(`Pot with index ${index} not found`);
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
    
    // Method to handle adding a pot to a machine
    addPotToMachine(potIndex, machineIndex) {
        console.log("Adding pot to machine, potIndex:", potIndex, "machineIndex:", machineIndex);
        
        // Convert potIndex to a number if it's a string
        const potIndexNum = parseInt(potIndex, 10);
        
        // Get the mixing pot
        const pot = this.mixingHall.mixingPots[potIndexNum];
        
        if (!pot) {
            console.error(`Pot with index ${potIndexNum} not found`);
            return false;
        }
        
        // Log pot contents to debug
        console.log("Pot contents:", pot);
        console.log("Pot ingredients:", pot.ingredients);
        
        // Get the mixing machine
        const machine = this.mixingHall.mixMachines[machineIndex];
        
        if (!machine) {
            console.error(`Machine with index ${machineIndex} not found`);
            return false;
        }
        
        // Check if the pot has any ingredients
        if (!pot.ingredients || pot.ingredients.length === 0) {
            console.warn("Cannot add empty pot to machine");
            return false;
        }
        
        // Check if machine already has contents
        if (machine.pot_contents && machine.pot_contents.length > 0) {
            console.warn("Machine already has a pot");
            return false;
        }
        
        // Move the pot ingredients to the machine
        machine.pot_contents = [...pot.ingredients];
        
        // Set machine properties based on the ingredients
        if (pot.ingredients.length > 0) {
            // Use first ingredient for mixing properties
            const firstIngredient = pot.ingredients[0];
            machine.mixingSpeed = firstIngredient.mixingSpeed;
            
            // Find the longest mixing time
            let longestTime = 0;
            pot.ingredients.forEach(ingredient => {
                const time = parseInt(ingredient.amountOfMixingTime, 10);
                if (time > longestTime) {
                    longestTime = time;
                }
            });
            
            machine.mixingTime = longestTime;
        }
        
        // Set the machine status to mixing
        machine.status = MixingMachineStatus.MIXING;
        
        // Store the ID of the removed pot for reference
        const potId = pot.id;
        
        // Remove the pot from the mixingHall's mixingPots array
        this.mixingHall.mixingPots.splice(potIndexNum, 1);
        
        // Update IDs for all remaining pots to match their array index
        this.mixingHall.mixingPots.forEach((remainingPot, index) => {
            remainingPot.id = index;
        });
        
        console.log("Machine after adding pot:", machine);
        console.log("Remaining pots:", this.mixingHall.mixingPots);
        
        return true;
    }
}