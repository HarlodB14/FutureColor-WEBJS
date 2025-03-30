export default class MachineView {
    constructor(controller) {
        this.controller = controller;
    }

    drawMixingMachines(mixingMachines) {
        let areaContainer = document.getElementById("machineAreaContainer");
        if (!areaContainer) {
            return; // The container should already exist from setupLayout
        }

        let container = document.getElementById("mixingMachinesContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "mixingMachinesContainer";
            areaContainer.appendChild(container);
        }

        // Clear existing machines
        container.innerHTML = "";

        // Create each machine in vertical layout
        mixingMachines.forEach((machine, index) => {
            const machineDiv = document.createElement("div");
            machineDiv.className = "mixing-machine";
            machineDiv.setAttribute("data-index", index);

            // Machine label
            const machineLabel = document.createElement("div");
            machineLabel.className = "machine-label";
            machineLabel.textContent = `Mixer ${index + 1}`;
            machineDiv.appendChild(machineLabel);

            // Status indicator
            const statusLight = document.createElement("div");
            statusLight.className = "status-light";
            machineDiv.appendChild(statusLight);

            // Drop zone for pots
            const dropZone = document.createElement("div");
            dropZone.className = "machine-drop-zone";
            
            // If the machine already has pot contents from the model, show them
            if (machine.pot_contents && machine.pot_contents.length > 0) {
                const potClone = document.createElement("div");
                potClone.className = "mixing-pot-in-machine";
                
                // Create properly styled representations of each ingredient in the pot
                machine.pot_contents.forEach(ingredient => {
                    const ingredientDiv = document.createElement("div");
                    ingredientDiv.className = 'ingredient';
                    
                    // Add the appropriate structure class based on the ingredient
                    const structureClass = this.getStructureClass(ingredient.structure);
                    if (structureClass) {
                        ingredientDiv.classList.add(structureClass);
                    }
                    
                    ingredientDiv.style.backgroundColor = ingredient.color;
                    
                    // Set width and height based on structure
                    if (structureClass === 'grain') {
                        ingredientDiv.style.width = '15px';
                        ingredientDiv.style.height = '15px';
                    } else if (structureClass === 'rough-grain') {
                        ingredientDiv.style.width = '25px';
                        ingredientDiv.style.height = '25px';
                    } else if (structureClass === 'smooth') {
                        ingredientDiv.style.width = '20px';
                        ingredientDiv.style.height = '20px';
                    } else if (structureClass === 'slimey') {
                        ingredientDiv.style.width = '25px';
                        ingredientDiv.style.height = '15px';
                    }
                    
                    ingredientDiv.textContent = this.getStructureText(ingredient.structure);
                    potClone.appendChild(ingredientDiv);
                });
                
                dropZone.appendChild(potClone);
                dropZone.classList.add("pot-loaded");
            } else {
                dropZone.textContent = "Drop mixing pot here";
            }
            
            machineDiv.appendChild(dropZone);

            // Make drop zone functional
            dropZone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropZone.classList.add("dragover");
            });
            
            dropZone.addEventListener("dragleave", () => {
                dropZone.classList.remove("dragover");
            });
            
            dropZone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropZone.classList.remove("dragover");
                
                // Get the dragged pot's index from the dataTransfer
                const potIndex = e.dataTransfer.getData("text");
                
                // Only proceed if we have a valid pot index
                if (potIndex) {
                    this.handlePotDrop(potIndex, index, dropZone);
                }
            });

            container.appendChild(machineDiv);
        });
    }

    handlePotDrop(potIndex, machineIndex, dropZone) {
        console.log(`Pot ${potIndex} dropped into Machine ${machineIndex}`);
        
        // Get the original pot element
        const originalPot = document.querySelector(`#mixingPotsContainer > [data-index="${potIndex}"]`);
        
        if (!originalPot) {
            console.error("Original pot not found");
            return;
        }
        
        // Send this information to the controller to update the model
        const success = this.controller.addPotToMachine(potIndex, machineIndex);
        
        if (!success) {
            // Handle failure - perhaps the pot was empty or invalid
            this.showMachineError(dropZone, "Cannot process empty pot");
            return;
        }
        
        // Get the pot ingredients from the machine model
        const machine = this.controller.mixingHall.mixMachines[machineIndex];
        if (!machine || !machine.pot_contents) {
            console.error("Machine or pot contents not found");
            return;
        }
        
        // Create a visual representation of the pot in the machine
        const potClone = document.createElement("div");
        potClone.className = "mixing-pot-in-machine";
        
        // Create properly styled representations of each ingredient
        machine.pot_contents.forEach(ingredient => {
            const ingredientDiv = document.createElement("div");
            ingredientDiv.className = 'ingredient';
            
            // Add the appropriate structure class based on the ingredient
            const structureClass = this.getStructureClass(ingredient.structure);
            if (structureClass) {
                ingredientDiv.classList.add(structureClass);
            }
            
            ingredientDiv.style.backgroundColor = ingredient.color;
            
            // Set width and height based on structure
            if (structureClass === 'grain') {
                ingredientDiv.style.width = '15px';
                ingredientDiv.style.height = '15px';
            } else if (structureClass === 'rough-grain') {
                ingredientDiv.style.width = '25px';
                ingredientDiv.style.height = '25px';
            } else if (structureClass === 'smooth') {
                ingredientDiv.style.width = '20px';
                ingredientDiv.style.height = '20px';
            } else if (structureClass === 'slimey') {
                ingredientDiv.style.width = '25px';
                ingredientDiv.style.height = '15px';
            }
            
            ingredientDiv.textContent = this.getStructureText(ingredient.structure);
            potClone.appendChild(ingredientDiv);
        });
        
        // Update the visual of the drop zone
        dropZone.innerHTML = "";
        dropZone.appendChild(potClone);
        
        // Change styling to show the pot is now in the machine
        dropZone.classList.add("pot-loaded");
        
        // Remove the original pot from the view
        originalPot.remove();
        
        // Important: Redraw the mixing pots to update indexes
        this.controller.view.drawMixingPots(this.controller.mixingHall.mixingPots);
    }
    
    // Helper method to get structure class
    getStructureClass(structure) {
        switch (structure) {
            case "korrel": return 'grain';
            case "grove korrel": return 'rough-grain';
            case "glad": return 'smooth';
            case "slijmerig": return 'slimey';
            default: return '';
        }
    }
    
    // Helper method to get structure text
    getStructureText(structure) {
        switch (structure) {
            case "korrel": return 'K';
            case "grove korrel": return 'GK';
            case "glad": return 'G';
            case "slijmerig": return 'S';
            default: return '';
        }
    }
    
    showMachineError(element, message) {
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'machine-error';
        errorDiv.textContent = message;
        
        // Add error to element
        element.appendChild(errorDiv);
        
        // Remove error after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode === element) {
                element.removeChild(errorDiv);
            }
        }, 3000);
    }
}