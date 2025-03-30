export default class ButtonView {
    constructor(controller) {
        this.controller = controller;
    }

    drawButtonContainer() {
        let rightContainer = document.getElementById("rightContainer");
        if (!rightContainer) {
            return; // The container should already exist from setupLayout
        }

        // Clear existing content
        this.clearMixedPotsContainer();

        // Create the button container
        let buttonContainer = document.createElement("div");
        buttonContainer.id = "addPotButtonContainer";

        // Button to add a new mixing pot
        let addPotButton = document.createElement("button");
        addPotButton.className = "action-button";
        addPotButton.id = "addNewMixingPot";
        addPotButton.textContent = "Mengpot toevoegen";
        addPotButton.addEventListener("click", () => this.controller.createMixingPot());

        // Button to add a new mixing machine
        let addMachineButton = document.createElement("button");
        addMachineButton.className = "action-button";
        addMachineButton.id = "addNewMixingMachine";
        addMachineButton.textContent = "Mixmachine toevoegen";
        addMachineButton.addEventListener("click", () => this.controller.createMixingMachine());

        buttonContainer.appendChild(addPotButton);
        buttonContainer.appendChild(addMachineButton);
        rightContainer.appendChild(buttonContainer);

        // Create container for mixed pots (initially empty)
        this.createMixedPotsContainer(rightContainer);
    }

    // Method to create the mixed pots container
    createMixedPotsContainer(parentContainer) {
        // Check if container already exists
        if (document.getElementById("mixedPotsContainer")) {
            return;
        }

        // Create container for mixed pots
        const mixedPotsContainer = document.createElement("div");
        mixedPotsContainer.id = "mixedPotsContainer";
        mixedPotsContainer.className = "mixed-pots-container";
        
        // Add heading
        const heading = document.createElement("h3");
        heading.textContent = "Mixed Colors";
        mixedPotsContainer.appendChild(heading);
        
        // Add to parent container after the button container
        const buttonContainer = document.getElementById("addPotButtonContainer");
        if (buttonContainer) {
            parentContainer.insertBefore(mixedPotsContainer, buttonContainer.nextSibling);
        } else {
            parentContainer.appendChild(mixedPotsContainer);
        }
    }

    // Method to clear the mixed pots container if it exists
    clearMixedPotsContainer() {
        const existingContainer = document.getElementById("mixedPotsContainer");
        if (existingContainer) {
            existingContainer.remove();
        }
    }

    // Method to add a mixed pot to the container
    addMixedPot(mixedColor) {
        // Get or create the container
        let mixedPotsContainer = document.getElementById("mixedPotsContainer");
        if (!mixedPotsContainer) {
            this.createMixedPotsContainer(document.getElementById("rightContainer"));
            mixedPotsContainer = document.getElementById("mixedPotsContainer");
        }
        
        // Create mixed pot element
        const mixedPot = document.createElement("div");
        mixedPot.className = "mixed-result-pot";
        mixedPot.style.backgroundColor = mixedColor;
        
        // Add label to show the HSL value
        const hslLabel = document.createElement("div");
        hslLabel.className = "hsl-value-label";
        hslLabel.textContent = mixedColor;
        mixedPot.appendChild(hslLabel);
        
        // Add to the container
        mixedPotsContainer.appendChild(mixedPot);
        
        return mixedPot;
    }
}