export default class MachineView {
    constructor(controller) {
        this.controller = controller;
        // Track active mixing animations
        this.activeMixingAnimations = new Map();
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

            // Remove button (replaces status light)
            const removeButton = document.createElement("button");
            removeButton.className = "remove-button";
            removeButton.textContent = "X";
            // Add click event for removal
            removeButton.addEventListener("click", () => this.removeMachine(index));
            machineDiv.appendChild(removeButton);

            // Drop zone for pots
            const dropZone = document.createElement("div");
            dropZone.className = "machine-drop-zone";
            dropZone.id = `machine-drop-zone-${index}`;
            
            // If the machine already has pot contents from the model, show them
            if (machine.pot_contents && machine.pot_contents.length > 0 && machine.status !== "finished") {
                // Create the pot visual
                const potClone = document.createElement("div");
                potClone.className = "mixing-pot-in-machine";
                
                // Check machine status
                if (machine.status === "mixing") {
                    // If a mixing animation was in progress, restore it
                    this.renderMixingInProgress(potClone, machine, index);
                } else {
                    // Render ingredients in the pot
                    this.renderPotIngredients(potClone, machine.pot_contents);
                }
                
                dropZone.appendChild(potClone);
                dropZone.classList.add("pot-loaded");
            } else {
                dropZone.textContent = "Drop mixing pot here";
                dropZone.classList.remove("pot-loaded");
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

    // Render ingredients in a pot
    renderPotIngredients(potElement, ingredients) {
        // Clear any existing content
        potElement.innerHTML = '';
        
        // Create properly styled representations of each ingredient
        ingredients.forEach(ingredient => {
            const ingredientDiv = document.createElement("div");
            ingredientDiv.className = 'ingredient';
            
            // Add the appropriate structure class based on the ingredient
            const structureClass = this.getStructureClass(ingredient.structure);
            if (structureClass) {
                ingredientDiv.classList.add(structureClass);
            }
            
            ingredientDiv.style.backgroundColor = ingredient.color;
            
            // Set size based on structure
            this.setSizeBasedOnStructure(ingredientDiv, structureClass);
            
            ingredientDiv.textContent = this.getStructureText(ingredient.structure);
            potElement.appendChild(ingredientDiv);
        });
    }

    // Render a pot that is currently mixing (with progress bar)
    renderMixingInProgress(potElement, machine, machineIndex) {
        // Add mixing-in-progress class to the pot
        potElement.classList.add('mixing-in-progress');
        
        // Create a container for the ingredients (they'll be hidden during mixing)
        const ingredientsContainer = document.createElement('div');
        ingredientsContainer.className = 'ingredients-container';
        ingredientsContainer.style.opacity = '0.3'; // Fade the ingredients during mixing
        this.renderPotIngredients(ingredientsContainer, machine.pot_contents);
        potElement.appendChild(ingredientsContainer);
        
        // Create the progress bar container
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'mixing-progress-container';
        
        // Create the progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'mixing-progress-bar';
        progressBar.style.height = '0%'; // Start at 0%
        
        progressBarContainer.appendChild(progressBar);
        potElement.appendChild(progressBarContainer);
        
        // Get the current progress if animation is already running
        const existingAnimation = this.activeMixingAnimations.get(machineIndex);
        if (existingAnimation) {
            // Calculate remaining time
            const elapsedTime = Date.now() - existingAnimation.startTime;
            const remainingTime = Math.max(0, existingAnimation.duration - elapsedTime);
            const progress = (elapsedTime / existingAnimation.duration) * 100;
            
            // Update progress bar to current progress
            progressBar.style.height = `${progress}%`;
            
            // Continue the animation from current point
            if (remainingTime > 0) {
                this.animateMixingProgress(progressBar, remainingTime, machineIndex, potElement, machine);
            }
        }
    }

    // Calculate the mixed color from all ingredients using proper HSL mixing
    calculateMixedColor(ingredients) {
        if (!ingredients || ingredients.length === 0) {
            return 'hsl(0, 0%, 50%)'; // Default gray if no ingredients
        }
        
        if (ingredients.length === 1) {
            return ingredients[0].color; // Return the only ingredient's color
        }
        
        // Parse all colors to get HSL values
        const hslValues = ingredients.map(ingredient => {
            return this.parseHSL(ingredient.color);
        }).filter(hsl => hsl !== null); // Filter out any null values
        
        if (hslValues.length === 0) {
            return 'hsl(0, 0%, 50%)'; // Default if all parsing failed
        }
        
        // For proper color mixing, we'll use RGB space which is more intuitive for mixing
        // Convert all HSL values to RGB
        const rgbValues = hslValues.map(hsl => this.hslToRgb(hsl.h, hsl.s, hsl.l));
        
        // Average the RGB values
        let totalR = 0, totalG = 0, totalB = 0;
        
        rgbValues.forEach(rgb => {
            totalR += rgb.r;
            totalG += rgb.g;
            totalB += rgb.b;
        });
        
        // Calculate average RGB
        const avgR = Math.round(totalR / rgbValues.length);
        const avgG = Math.round(totalG / rgbValues.length);
        const avgB = Math.round(totalB / rgbValues.length);
        
        // Convert back to HSL for display
        const hsl = this.rgbToHsl(avgR, avgG, avgB);
        
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    }

    // Helper method to convert HSL to RGB
    hslToRgb(h, s, l) {
        // Convert HSL percentages to decimals
        s /= 100;
        l /= 100;
        
        // Formula to convert HSL to RGB
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (h >= 0 && h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (h >= 60 && h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (h >= 120 && h < 180) {
            [r, g, b] = [0, c, x];
        } else if (h >= 180 && h < 240) {
            [r, g, b] = [0, x, c];
        } else if (h >= 240 && h < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    // Helper method to convert RGB to HSL
    rgbToHsl(r, g, b) {
        // Convert RGB to decimals
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            // Achromatic (gray)
            h = 0;
            s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h = h * 60;
        }
        
        return {
            h: h,
            s: s * 100,
            l: l * 100
        };
    }

    // Parse HSL color string to components
    parseHSL(hslStr) {
        const regex = /hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i;
        const match = hslStr.match(regex);
        
        if (match) {
            return {
                h: parseInt(match[1], 10),
                s: parseInt(match[2], 10),
                l: parseInt(match[3], 10)
            };
        }
        
        return null;
    }

    // Animate the mixing progress bar
    animateMixingProgress(progressBar, duration, machineIndex, potElement, machine) {
        // Store animation start time
        const startTime = Date.now();
        
        // Store animation info for potential redraw
        this.activeMixingAnimations.set(machineIndex, {
            startTime,
            duration,
            potElement,
            machine
        });
        
        // Mark machine as mixing
        machine.status = "mixing";
        
        // Create animation function
        const animate = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(100, (elapsedTime / duration) * 100);
            
            // Update progress bar height
            progressBar.style.height = `${progress}%`;
            
            if (progress < 100) {
                // Continue animation
                requestAnimationFrame(animate);
            } else {
                // Animation complete
                machine.status = "finished";
                
                // Clean up animation reference
                this.activeMixingAnimations.delete(machineIndex);
                
                // Create a mixed pot and add to button area
                this.addMixedPotToButtonView(machine, machineIndex);
            }
        };
        
        // Start the animation
        requestAnimationFrame(animate);
    }

    // Create a new finished pot in the button area and clear the machine
    addMixedPotToButtonView(machine, machineIndex) {
        // Calculate mixed color
        const mixedColor = this.calculateMixedColor(machine.pot_contents);
        
        // Use the ButtonView to add the mixed pot
        if (this.controller.view.buttonView) {
            this.controller.view.buttonView.addMixedPot(mixedColor);
        } else {
            console.error("ButtonView not available");
        }
        
        // Clear the machine's contents and status
        machine.pot_contents = [];
        machine.mixingSpeed = 0;
        machine.mixingTime = 0;
        machine.status = "empty";
        
        // Redraw the machines to update the view
        this.drawMixingMachines(this.controller.mixingHall.mixMachines);
    }

    handlePotDrop(potIndex, machineIndex, dropZone) {
        console.log(`Pot ${potIndex} dropped into Machine ${machineIndex}`);
        
        // Get the original pot element
        const originalPot = document.querySelector(`#mixingPotsContainer .mixing-pot-container > [data-index="${potIndex}"]`);
        
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
        
        // Add the pot to the drop zone
        dropZone.innerHTML = "";
        dropZone.appendChild(potClone);
        dropZone.classList.add("pot-loaded");
        
        // Remove the original pot from the view (find container and remove it)
        const potContainer = originalPot.closest('.mixing-pot-container');
        if (potContainer) {
            potContainer.remove();
        }
        
        // Important: Redraw the mixing pots to update indexes
        this.controller.view.drawMixingPots(this.controller.mixingHall.mixingPots);
        
        // Find the longest mixing time among ingredients
        let longestMixingTime = 0;
        machine.pot_contents.forEach(ingredient => {
            const mixingTime = parseInt(ingredient.amountOfMixingTime, 10);
            if (mixingTime > longestMixingTime) {
                longestMixingTime = mixingTime;
            }
        });
        
        // Create a container for ingredients (they'll be visible but faded during mixing)
        const ingredientsContainer = document.createElement('div');
        ingredientsContainer.className = 'ingredients-container';
        ingredientsContainer.style.opacity = '0.3';
        this.renderPotIngredients(ingredientsContainer, machine.pot_contents);
        potClone.appendChild(ingredientsContainer);
        
        // Create progress bar container
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'mixing-progress-container';
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'mixing-progress-bar';
        progressBar.style.height = '0%';
        
        progressBarContainer.appendChild(progressBar);
        potClone.appendChild(progressBarContainer);
        
        // Start mixing animation (speed up animation for testing if mixing time is very long)
        const animationDuration = Math.min(30000, longestMixingTime); // Cap at 30 seconds max for UX
        this.animateMixingProgress(progressBar, animationDuration, machineIndex, potClone, machine);
    }
    
    // Helper method to set ingredient size based on structure
    setSizeBasedOnStructure(element, structureClass) {
        if (structureClass === 'grain') {
            element.style.width = '15px';
            element.style.height = '15px';
        } else if (structureClass === 'rough-grain') {
            element.style.width = '25px';
            element.style.height = '25px';
        } else if (structureClass === 'smooth') {
            element.style.width = '20px';
            element.style.height = '20px';
        } else if (structureClass === 'slimey') {
            element.style.width = '25px';
            element.style.height = '15px';
        }
    }
    
    // Helper method to remove a machine
    removeMachine(index) {
        // Check if the machine exists
        if (this.controller.mixingHall.mixMachines[index]) {
            // Stop any active animation
            if (this.activeMixingAnimations.has(index)) {
                this.activeMixingAnimations.delete(index);
            }
            
            // Remove the machine from the model
            this.controller.mixingHall.mixMachines.splice(index, 1);
            
            // Update IDs for all remaining machines to match their array index
            this.controller.mixingHall.mixMachines.forEach((machine, i) => {
                machine.id = i;
            });
            
            // Redraw all machines to update indexes
            this.drawMixingMachines(this.controller.mixingHall.mixMachines);
            
            console.log(`Removed mixing machine at index ${index}`);
            console.log("Remaining machines:", this.controller.mixingHall.mixMachines);
        } else {
            console.error(`Machine with index ${index} not found`);
        }
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