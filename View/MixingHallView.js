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
        this.ingredientView.drawMixingPots(this.controller.mixingHall.mixingPots);
        this.buttonView.drawButtonContainer();
        this.machineView.drawMixingMachines(this.controller.mixingHall.mixMachines);
    }
    
    // Update weather text with data provided by controller
    updateWeatherText(temperature, isPrecipitation) {
        this.ingredientView.updateWeatherText(temperature, isPrecipitation);
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

        // Create right area for buttons (40%)
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