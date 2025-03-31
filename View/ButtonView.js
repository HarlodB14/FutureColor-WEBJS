import ColorTester from '../Model/ColorTester.js';

export default class ButtonView {
    constructor(controller) {
        this.controller = controller;
        this.colorTester = new ColorTester(controller);
        // Track mixed pots for removal functionality
        this.mixedPots = [];
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
        
        // Create color tester container (below mixed pots)
        this.createColorTesterContainer(rightContainer);
    }
    
    // Create the color tester container
    createColorTesterContainer(parentContainer) {
        // Remove existing tester if any
        const existingTester = document.getElementById("colorTesterContainer");
        if (existingTester) {
            existingTester.remove();
        }
        
        // Create container for the color tester
        const testerContainer = document.createElement("div");
        testerContainer.id = "colorTesterContainer";
        testerContainer.className = "color-tester-section";
        
        // Add to parent container after mixed pots container
        const mixedPotsContainer = document.getElementById("mixedPotsContainer");
        if (mixedPotsContainer) {
            parentContainer.insertBefore(testerContainer, mixedPotsContainer.nextSibling);
        } else {
            const buttonContainer = document.getElementById("addPotButtonContainer");
            if (buttonContainer) {
                parentContainer.insertBefore(testerContainer, buttonContainer.nextSibling);
            } else {
                parentContainer.appendChild(testerContainer);
            }
        }
        
        // Draw the grid in the container
        this.colorTester.drawGrid(testerContainer);
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
        heading.textContent = "Gemengde Kleuren";
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
            // Clear the tracked pots array when removing the container
            this.mixedPots = [];
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
        
        // Create a container for the mixed pot and its remove button
        const potContainer = document.createElement("div");
        potContainer.className = "mixing-pot-container";
        potContainer.style.position = "relative";
        potContainer.style.display = "inline-block";
        potContainer.style.margin = "5px";
        
        // Create mixed pot element
        const mixedPot = document.createElement("div");
        mixedPot.className = "mixed-result-pot";
        mixedPot.style.backgroundColor = mixedColor;
        
        // Make it draggable
        mixedPot.draggable = true;
        
        // Set up drag events
        mixedPot.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', mixedColor);
            e.dataTransfer.effectAllowed = 'copy';
            
            // Add a visual indicator for dragging
            mixedPot.style.opacity = '0.6';
        });
        
        mixedPot.addEventListener('dragend', () => {
            // Reset visual style
            mixedPot.style.opacity = '1';
        });
        
        // Add label to show the HSL value
        const hslLabel = document.createElement("div");
        hslLabel.className = "hsl-value-label";
        hslLabel.textContent = mixedColor;
        mixedPot.appendChild(hslLabel);
        
        // Create remove button
        const removeButton = document.createElement("button");
        removeButton.className = "remove-button pot-remove-button";
        removeButton.textContent = "X";
        removeButton.style.zIndex = "100";
        
        // Add click event to remove this mixed pot
        removeButton.addEventListener("click", () => {
            // Remove from DOM
            potContainer.remove();
            
            // Remove from tracked array
            const index = this.mixedPots.indexOf(potContainer);
            if (index !== -1) {
                this.mixedPots.splice(index, 1);
            }
        });
        
        // Add mixed pot and remove button to the container
        potContainer.appendChild(mixedPot);
        potContainer.appendChild(removeButton);
        
        // Add to the mixed pots container
        mixedPotsContainer.appendChild(potContainer);
        
        // Track this pot for potential later operations
        this.mixedPots.push(potContainer);
        
        return mixedPot;
    }
}