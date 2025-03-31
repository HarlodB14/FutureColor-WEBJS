export default class MachineView {
    constructor(controller) {
        this.controller = controller;
        // Track active mixing animations for both halls
        this.activeMixingAnimations = new Map();
        // Track which machines have completed mixing to avoid duplicates
        this.completedMixings = new Set();
        // Track absolute start times of animations to properly handle hall switching
        this.animationStartTimes = new Map();
    }

    drawMixingMachines(mixingMachines) {
        let areaContainer = document.getElementById("machineAreaContainer");
        if (!areaContainer) {
            return; // The container should already exist from setupLayout
        }

        // Get the hall switcher if it exists
        const hallSwitcher = document.querySelector('.hall-switcher-container');

        let container = document.getElementById("mixingMachinesContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "mixingMachinesContainer";
            
            // Insert after the hall switcher if it exists
            if (hallSwitcher) {
                areaContainer.insertBefore(container, hallSwitcher.nextSibling);
            } else {
                areaContainer.appendChild(container);
            }
        }

        // Clear existing machines
        container.innerHTML = "";

        // Get hall index for animation tracking
        const hallIndex = this.controller.activeHallIndex;

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
            
            const machineKey = `hall${hallIndex}-machine${index}`;
            
            // If the machine already has pot contents from the model, show them
            if (machine.pot_contents && machine.pot_contents.length > 0) {
                // Create the pot visual
                const potClone = document.createElement("div");
                potClone.className = "mixing-pot-in-machine";
                
                // Check machine status
                if (machine.status === "mixing") {
                    // Render the currently mixing pot with appropriate timing
                    this.renderMixingInProgress(potClone, machine, machineKey);
                } else if (machine.status === "finished") {
                    // Render finished state
                    this.renderFinishedMixing(potClone, machine);
                } else {
                    // Just render ingredients for non-mixing machines
                    this.renderPotIngredients(potClone, machine.pot_contents);
                }
                
                dropZone.appendChild(potClone);
                dropZone.classList.add("pot-loaded");
            } else {
                dropZone.textContent = "Plaats mengpot hier";
                dropZone.classList.remove("pot-loaded");
                
                // If temperature is too high and another machine is mixing, disable this drop zone
                if (this.controller.isHighTemperatureRestrictionActive() && 
                    this.controller.isAnyMachineMixing(this.controller.getActiveMixingHall())) {
                    dropZone.classList.add("disabled-drop-zone");
                    dropZone.textContent = "Te warm! Niet beschikbaar";
                }
            }
            
            machineDiv.appendChild(dropZone);

            // Make drop zone functional
            dropZone.addEventListener("dragover", (e) => {
                // Prevent drop if high temperature restriction is active
                if (dropZone.classList.contains("disabled-drop-zone")) {
                    e.preventDefault();
                    return;
                }
                
                e.preventDefault();
                dropZone.classList.add("dragover");
            });
            
            dropZone.addEventListener("dragleave", () => {
                dropZone.classList.remove("dragover");
            });
            
            dropZone.addEventListener("drop", (e) => {
                e.preventDefault();
                
                // Check for high temperature restriction
                if (dropZone.classList.contains("disabled-drop-zone")) {
                    this.showMachineError(dropZone, "Kan meerdere machines niet gebruiken bij hoge temperaturen");
                    return;
                }
                
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
            ingredientDiv.textContent = this.getStructureText(ingredient.structure);
            potElement.appendChild(ingredientDiv);
        });
    }

    // Render a finished mixed pot
    renderFinishedMixing(potElement, machine) {
        // Calculate the mixed color
        const mixedColor = this.calculateMixedColor(machine.pot_contents);
        
        // Set the pot's background color to the mixed color
        potElement.style.backgroundColor = mixedColor;
        
        // Add a label indicating it's finished
        const finishedLabel = document.createElement('div');
        finishedLabel.className = 'finished-mixing-label';
        finishedLabel.textContent = 'Klaar!';
        potElement.appendChild(finishedLabel);
    }

    // Render a pot that is currently mixing (with progress bar)
    renderMixingInProgress(potElement, machine, machineKey) {
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
        
        // Create time info display
        const timeInfoContainer = document.createElement('div');
        timeInfoContainer.className = 'time-info-container';
        
        // Add mixing time display
        if (machine.mixingTime) {
            timeInfoContainer.textContent = `Tijd: ${machine.mixingTime}ms`;
            
            // Add weather effect indicator if applicable
            const precipitation = this.controller.isPrecipitation;
            const temperature = this.controller.currentTemperature;
            
            if (precipitation || temperature < 10) {
                const timeInfoNote = document.createElement('div');
                timeInfoNote.className = 'time-info-note';
                
                let adjustmentText = '';
                if (precipitation && temperature < 10) {
                    adjustmentText = '(Weer: +25%)';
                } else if (precipitation) {
                    adjustmentText = '(Regen: +10%)';
                } else if (temperature < 10) {
                    adjustmentText = '(Koud: +15%)';
                }
                
                timeInfoNote.textContent = adjustmentText;
                timeInfoContainer.appendChild(timeInfoNote);
            }
        }
        
        potElement.appendChild(timeInfoContainer);
        
        // Get the animation start time from our storage or use current time as fallback
        const startTime = this.animationStartTimes.get(machineKey) || Date.now();
        const duration = machine.mixingTime; // Use the machine's mixing time
        
        // Calculate current progress based on elapsed time
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(100, (elapsedTime / duration) * 100);
        
        // Update the progress bar to show current progress
        progressBar.style.height = `${progress}%`;
        
        // Add the progress bar to the container
        progressBarContainer.appendChild(progressBar);
        potElement.appendChild(progressBarContainer);
        
        // Add mixing animation class to pot
        potElement.classList.add('mixing-in-progress');
        
        // If we haven't completed mixing yet and there's still time left, continue animation
        if (!this.completedMixings.has(machineKey) && progress < 100) {
            const remainingTime = duration - elapsedTime;
            
            if (remainingTime > 0) {
                // Continue the animation with remaining time
                this.animateMixingProgress(
                    progressBar, 
                    remainingTime, 
                    machineKey, 
                    potElement, 
                    machine,
                    startTime
                );
            } else {
                // If time has expired but we haven't marked it complete yet, complete it now
                this.completeMixing(machine, machineKey);
            }
        }
    }

    // Method to complete mixing process
    completeMixing(machine, machineKey) {
        // Mark this machine as completed
        this.completedMixings.add(machineKey);
        
        // Animation complete
        machine.status = "finished";
        
        // Clean up animation reference
        this.activeMixingAnimations.delete(machineKey);
        
        // We keep the start time in case we need to reference when this completed
        
        // Create a mixed pot and add to button area - only once
        this.addMixedPotToButtonView(machine, machineKey);
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
    animateMixingProgress(progressBar, duration, machineKey, potElement, machine, startTime) {
        // Reset the completed flag for this machine to ensure proper animation
        this.completedMixings.delete(machineKey);
        
        // Store the absolute start time for consistent timing across hall switches
        if (!this.animationStartTimes.has(machineKey)) {
            this.animationStartTimes.set(machineKey, startTime);
        }
        
        // Store animation info for potential redraw
        this.activeMixingAnimations.set(machineKey, {
            startTime: this.animationStartTimes.get(machineKey),
            duration: machine.mixingTime, // Always use the full duration from machine
            potElement,
            machine
        });
        
        // Mark machine as mixing
        machine.status = "mixing";
        
        // Add the mixing animation class to the pot element
        potElement.classList.add('mixing-in-progress');
        
        // Create animation function
        const animate = () => {
            // Check if this machine's mixing has been completed already
            if (this.completedMixings.has(machineKey)) {
                return; // Skip animation if already completed
            }
            
            // Calculate progress based on the original start time
            const currentTime = Date.now();
            const totalElapsedTime = currentTime - this.animationStartTimes.get(machineKey);
            const totalDuration = machine.mixingTime;
            const progress = Math.min(100, (totalElapsedTime / totalDuration) * 100);
            
            // Update progress bar height if it exists
            if (progressBar && progressBar.style) {
                progressBar.style.height = `${progress}%`;
            }
            
            if (progress < 100) {
                // Continue animation
                requestAnimationFrame(animate);
            } else {
                // Complete the mixing process
                this.completeMixing(machine, machineKey);
                
                // Remove mixing animation class
                if (potElement) {
                    potElement.classList.remove('mixing-in-progress');
                }
            }
        };
        
        // Start the animation if not already completed
        if (!this.completedMixings.has(machineKey)) {
            requestAnimationFrame(animate);
        }
    }

    // Create a new finished pot in the button area and clear the machine
    addMixedPotToButtonView(machine, machineKey) {
        // Only proceed if the machine has contents
        if (!machine.pot_contents || machine.pot_contents.length === 0) {
            console.warn(`Geen inhoud om te mengen voor ${machineKey}`);
            return;
        }
        
        // Calculate mixed color
        const mixedColor = this.calculateMixedColor(machine.pot_contents);
        
        // Use the ButtonView to add the mixed pot
        if (this.controller.view.buttonView) {
            this.controller.view.buttonView.addMixedPot(mixedColor);
        } else {
            console.error("ButtonView niet beschikbaar");
        }
        
        // Extract hall and machine indices from the key
        const keyParts = machineKey.match(/hall(\d+)-machine(\d+)/);
        if (keyParts && keyParts.length === 3) {
            const hallIndex = parseInt(keyParts[1], 10);
            const machineIndex = parseInt(keyParts[2], 10);
            
            // Get the specific hall
            const hall = this.controller.getMixingHall(hallIndex);
            if (hall && hall.mixMachines[machineIndex]) {
                // Clear the machine's contents and status
                hall.mixMachines[machineIndex].pot_contents = [];
                hall.mixMachines[machineIndex].mixingSpeed = 0;
                hall.mixMachines[machineIndex].mixingTime = 0;
                hall.mixMachines[machineIndex].status = "empty";
                
                // Remove the animation start time
                this.animationStartTimes.delete(machineKey);
                
                // If this is the active hall, redraw it
                if (hallIndex === this.controller.activeHallIndex) {
                    this.drawMixingMachines(hall.mixMachines);
                }
            }
        } else {
            // Fallback if parsing fails - clear the active hall's machine
            machine.pot_contents = [];
            machine.mixingSpeed = 0;
            machine.mixingTime = 0;
            machine.status = "empty";
            
            // Redraw the active hall's machines
            this.drawMixingMachines(this.controller.getActiveMixingHall().mixMachines);
        }
    }

    handlePotDrop(potIndex, machineIndex, dropZone) {
        // Get the active hall index for tracking
        const activeHallIndex = this.controller.activeHallIndex;
        const machineKey = `hall${activeHallIndex}-machine${machineIndex}`;
        
        // Get the original pot element
        const originalPot = document.querySelector(`#mixingPotsContainer .mixing-pot-container > [data-index="${potIndex}"]`);
        
        if (!originalPot) {
            console.error("Originele pot niet gevonden");
            return;
        }
        
        // Send this information to the controller to update the model
        const success = this.controller.addPotToMachine(potIndex, machineIndex);
        
        if (!success) {
            // Handle failure - perhaps the pot was empty or invalid
            this.showMachineError(dropZone, "Kan lege pot niet verwerken");
            return;
        }
        
        // Get the active hall
        const activeHall = this.controller.getActiveMixingHall();
        
        // Get the pot ingredients from the machine model
        const machine = activeHall.mixMachines[machineIndex];
        if (!machine || !machine.pot_contents) {
            console.error("Machine of potinhoud niet gevonden");
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
        this.controller.view.drawMixingPots(this.controller.mixingPots);
        
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
        
        // Create mixing time info display with weather adjustments
        const timeInfoContainer = document.createElement('div');
        timeInfoContainer.className = 'time-info-container';
        
        // Display the adjusted mixing time
        timeInfoContainer.textContent = `Tijd: ${machine.mixingTime}ms`;
        
        // Add weather effect indicators
        const precipitation = this.controller.isPrecipitation;
        const temperature = this.controller.currentTemperature;
        
        if (precipitation || temperature < 10) {
            const timeInfoNote = document.createElement('div');
            timeInfoNote.className = 'time-info-note';
            
            let adjustmentText = '';
            if (precipitation && temperature < 10) {
                adjustmentText = '(Weer: +25%)';
            } else if (precipitation) {
                adjustmentText = '(Regen: +10%)';
            } else if (temperature < 10) {
                adjustmentText = '(Koud: +15%)';
            }
            
            timeInfoNote.textContent = adjustmentText;
            timeInfoContainer.appendChild(timeInfoNote);
        }
        
        potClone.appendChild(timeInfoContainer);
        
        // Add mixing animation class to pot
        potClone.classList.add('mixing-in-progress');
        
        // Store the start time for this mixing operation
        const startTime = Date.now();
        this.animationStartTimes.set(machineKey, startTime);
        
        // Clear any existing animation state for this machine
        this.completedMixings.delete(machineKey);
        
        // Start mixing animation with the full duration
        const animationDuration = Math.min(30000, machine.mixingTime); // Cap at 30 seconds max for UX
        this.animateMixingProgress(progressBar, animationDuration, machineKey, potClone, machine, startTime);
        
        // If high temperature restriction is active, redraw all machines to disable others
        if (this.controller.isHighTemperatureRestrictionActive()) {
            this.drawMixingMachines(activeHall.mixMachines);
        }
    }
    
    // Helper method to remove a machine
    removeMachine(index) {
        // Get active hall index
        const hallIndex = this.controller.activeHallIndex;
        const machineKey = `hall${hallIndex}-machine${index}`;
        
        // Stop any active animation
        if (this.activeMixingAnimations.has(machineKey)) {
            this.activeMixingAnimations.delete(machineKey);
        }
        
        // Remove from completed set if it exists
        this.completedMixings.delete(machineKey);
        
        // Remove the animation start time
        this.animationStartTimes.delete(machineKey);
        
        // Remove the machine from the active hall using the controller method
        this.controller.removeMixingMachine(index);
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