import CreateInput from "../Helpers/CreateInput.js";
import Structures from "../Enums/Structures.js";

export default class MixingHallView {
    constructor(controller) {
        this.mixingPotContents = new Map();
        this.controller = controller;
        this.setupLayout();
    }

    setupLayout() {
        // Create main container that will hold all areas
        let mainContainer = document.createElement("div");
        mainContainer.id = "mainContainer";
        Object.assign(mainContainer.style, {
            display: "flex",
            width: "100%",
            minHeight: "100vh",
            position: "relative"
        });
        document.body.appendChild(mainContainer);

        // Create left area for mixing pots and ingredients (40%)
        let leftArea = document.createElement("div");
        leftArea.id = "mixingAreaContainer";
        Object.assign(leftArea.style, {
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: "40px",
            marginTop: "70px", // Increased to account for the form
            padding: "20px",
            width: "40%",
            minHeight: "100vh",
            boxSizing: "border-box"
        });
        mainContainer.appendChild(leftArea);

        // Create middle area for mixing machines (20%)
        let middleArea = document.createElement("div");
        middleArea.id = "machineAreaContainer";
        Object.assign(middleArea.style, {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            backgroundColor: "transparent",
            width: "20%",
            minHeight: "100vh",
            boxSizing: "border-box",
            borderLeft: "1px dashed #ccc",
            borderRight: "1px dashed #ccc"
        });
        mainContainer.appendChild(middleArea);

        // Create right area for buttons (40%)
        let rightArea = document.createElement("div");
        rightArea.id = "rightContainer";
        Object.assign(rightArea.style, {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "40px 20px",
            width: "40%",
            minHeight: "100vh",
            boxSizing: "border-box"
        });
        mainContainer.appendChild(rightArea);
    }

    drawButtonContainer() {
        let rightContainer = document.getElementById("rightContainer");
        if (!rightContainer) {
            return; // The container should already exist from setupLayout
        }

        let buttonContainer = document.createElement("div");
        buttonContainer.id = "addPotButtonContainer";
        Object.assign(buttonContainer.style, {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            marginTop: "20px"
        });

        // Button to add a new mixing pot
        let addPotButton = document.createElement("button");
        addPotButton.id = "addNewMixingPot";
        addPotButton.textContent = "Mengpot toevoegen";
        Object.assign(addPotButton.style, this.getButtonStyles());
        addPotButton.addEventListener("click", () => this.controller.createMixingPot());

        // Button to add a new mixing machine
        let addMachineButton = document.createElement("button");
        addMachineButton.id = "addNewMixingMachine";
        addMachineButton.textContent = "Mixmachine toevoegen";
        Object.assign(addMachineButton.style, this.getButtonStyles());
        addMachineButton.addEventListener("click", () => this.controller.createMixingMachine());

        buttonContainer.appendChild(addPotButton);
        buttonContainer.appendChild(addMachineButton);
        rightContainer.appendChild(buttonContainer);
    }

    getButtonStyles() {
        return {
            padding: "15px 20px",
            fontSize: "18px",
            cursor: "pointer",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "white",
            borderRadius: "5px",
            boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
            marginBottom: "10px",
            display: "block",
            width: "250px",
            transition: "all 0.3s ease"
        };
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

            Object.assign(container.style, {
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                padding: "20px",
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: "10px",
                border: "2px solid #333",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                width: "90%",
                maxWidth: "300px",
                overflowY: "auto",
                maxHeight: "90vh"
            });
        }

        // Clear existing machines
        container.innerHTML = "";

        // Create each machine in vertical layout
        mixingMachines.forEach((machine, index) => {
            const machineDiv = document.createElement("div");
            machineDiv.className = "mixing-machine";
            machineDiv.setAttribute("data-index", index);

            // Machine container
            Object.assign(machineDiv.style, {
                width: "100%",
                height: "250px",
                backgroundColor: "#f0f0f0",
                border: "3px solid #555",
                borderRadius: "5px",
                position: "relative",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                overflow: "hidden",
                padding: "15px",
                boxSizing: "border-box",
                marginBottom: "30px"
            });

            // Machine label
            const machineLabel = document.createElement("div");
            machineLabel.textContent = `Mixer ${index + 1}`;
            Object.assign(machineLabel.style, {
                width: "100%",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "18px",
                color: "#333",
                padding: "5px",
                backgroundColor: "rgba(200,200,200,0.5)",
                borderRadius: "3px",
                marginBottom: "10px"
            });
            machineDiv.appendChild(machineLabel);

            // Status indicator
            const statusLight = document.createElement("div");
            Object.assign(statusLight.style, {
                width: "15px",
                height: "15px",
                backgroundColor: "#4CAF50",
                borderRadius: "50%",
                position: "absolute",
                top: "10px",
                right: "10px",
                boxShadow: "0 0 5px rgba(0,0,0,0.3)"
            });
            machineDiv.appendChild(statusLight);

            // Drop zone for pots
            const dropZone = document.createElement("div");
            dropZone.className = "machine-drop-zone";
            Object.assign(dropZone.style, {
                width: "90%",
                height: "150px",
                backgroundColor: "rgba(200,200,200,0.5)",
                border: "2px dashed #666",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                color: "#444",
                textAlign: "center",
                padding: "10px",
                boxSizing: "border-box",
                marginTop: "auto"
            });
            dropZone.textContent = "Drop mixing pot here";
            machineDiv.appendChild(dropZone);

            // Make drop zone functional
            dropZone.addEventListener("dragover", (e) => {
                this.onDragOver(e);
                dropZone.style.backgroundColor = "rgba(180,180,255,0.5)";
            });
            dropZone.addEventListener("dragleave", () => {
                dropZone.style.backgroundColor = "rgba(200,200,200,0.5)";
            });
            dropZone.addEventListener("drop", (e) => {
                dropZone.style.backgroundColor = "rgba(200,200,200,0.5)";
                this.onMachineDrop(e, index);
            });

            container.appendChild(machineDiv);
        });
    }

    onMachineDrop(e, machineIndex) {
        e.preventDefault();
        const draggedIndex = e.dataTransfer.getData("text");
        let targetPot = e.target.closest("[data-index]");

        if (!targetPot) return;

        // You might want to add specific logic here for what happens
        // when a pot is dropped into a machine
        console.log(`Pot ${draggedIndex} dropped into Machine ${machineIndex}`);
        // this.controller.handlePotToMachine(draggedIndex, machineIndex);
    }

    drawMixingPots(mixingPots) {
        let areaContainer = document.getElementById("mixingAreaContainer");
        if (!areaContainer) {
            return; // The container should already exist from setupLayout
        }

        let container = document.getElementById("mixingPotsContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "mixingPotsContainer";
            areaContainer.appendChild(container);

            Object.assign(container.style, {
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                padding: "10px",
                backgroundColor: "transparent",
                borderRadius: "10px",
                boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                maxWidth: "120px",
            });
        }

        // Do not reset container.innerHTML, instead only add missing pots
        mixingPots.forEach((pot, index) => {
            if (document.querySelector(`[data-index="${index}"]`)) {
                return; // Skip existing pots
            }

            let potDiv = document.createElement("div");

            Object.assign(potDiv.style, {
                width: "80px",
                height: "100px",
                border: "10px solid black",
                borderTop: "none",
                borderRadius: "0 0 40px 40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                position: "relative",
                cursor: "move",
            });

            potDiv.draggable = true;
            potDiv.addEventListener("mousedown", this.mouseDown);
            potDiv.setAttribute("data-index", index);

            potDiv.addEventListener("dragstart", (e) => this.onDragStart(e));
            potDiv.addEventListener("dragover", (e) => this.onDragOver(e));
            potDiv.addEventListener("drop", (e) => this.onDrop(e));

            container.appendChild(potDiv);

            // Ensure existing ingredients stay in the correct pot
            this.updatePotContents(potDiv, index);
        });
    }

    drawIngredients(ingredients) {
        let container = document.getElementById("ingredientsContainer");

        if (container) {
            container.remove();
        }

        let areaContainer = document.getElementById("mixingAreaContainer");
        if (!areaContainer) {
            return; // The container should already exist from setupLayout
        }

        container = document.createElement("div");
        container.id = "ingredientsContainer";
        areaContainer.appendChild(container);

        Object.assign(container.style, {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "10px",
            backgroundColor: "transparent",
            borderRadius: "10px",
            boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
            maxWidth: "120px",
        });

        container.innerHTML = ''; // Reset de container

        ingredients.forEach((ingredient, index) => {
            let ingredientDiv = document.createElement("div");
            let {
                width,
                height,
                borderRadius,
                boxShadow,
                animation,
                innerText
            } = this.getShapeStyles(ingredient.structure);

            Object.assign(ingredientDiv.style, {
                width,
                height,
                borderRadius,
                boxShadow,
                animation,
                backgroundColor: ingredient.color,
                margin: "5px auto",
                border: "2px solid black",
                textAlign: "center",
                lineHeight: height,
                color: "white",
                fontSize: "12px",
                cursor: "move",
                position: "relative", // Added for tooltip positioning
            });

            ingredientDiv.draggable = true;
            ingredientDiv.setAttribute('data-index', index);
            ingredientDiv.setAttribute('data-mixing-speed', ingredient.mixingSpeed);

            // Add hover event listeners for tooltip
            ingredientDiv.addEventListener("mouseenter", this.showMixingSpeedTooltip);
            ingredientDiv.addEventListener("mouseleave", this.hideMixingSpeedTooltip);

            ingredientDiv.addEventListener("dragstart", (e) => this.onDragStart(e));
            ingredientDiv.addEventListener("dragover", (e) => this.onDragOver(e));
            ingredientDiv.addEventListener("drop", (e) => this.onDrop(e));

            ingredientDiv.innerText = innerText || '';
            container.appendChild(ingredientDiv);
        });
    }

    // New method to show tooltip
    showMixingSpeedTooltip(e) {
        const mixingSpeed = e.target.getAttribute('data-mixing-speed');
        
        let tooltip = document.createElement('div');
        tooltip.className = 'mixing-speed-tooltip';
        tooltip.textContent = `mixingspeed: ${mixingSpeed}`;
        
        Object.assign(tooltip.style, {
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: '1000'
        });
        
        e.target.appendChild(tooltip);
    }

    // New method to hide tooltip
    hideMixingSpeedTooltip(e) {
        const tooltip = e.target.querySelector('.mixing-speed-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    drawIngredientForm() {
        const container = document.createElement('div');
        container.className = 'formContainer';
        Object.assign(container.style, {
            position: "fixed",
            top: "0",
            left: "0",
            zIndex: "999",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "0 0 10px 0",
            boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)"
        });
        
        const form = document.createElement('form');
        form.className = 'ingredient-form';

        const structureLabel = document.createElement('label');
        structureLabel.setAttribute('for', 'structureSelect');
        structureLabel.textContent = 'Structuur:';
        form.appendChild(structureLabel);

        let structureSelect = document.createElement('select');
        structureSelect.name = 'structure';
        structureSelect.id = 'structureSelect';

        Structures.getValues().forEach((structure) => {
            let option = document.createElement('option');
            option.value = structure;
            option.textContent = structure;
            structureSelect.appendChild(option);
        });

        form.appendChild(structureSelect);

        let createInput = new CreateInput();
        form.appendChild(createInput.createInputField('Mengtijd (ms)', 'amountOfMixingTime', 'number'));
        form.appendChild(createInput.createInputField('Mengsnelheid', 'mixingSpeed', 'number'));
        form.appendChild(createInput.createInputField('Kleur (HSL)', 'color', 'text'));

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Ingrediënt aanmaken';
        form.appendChild(submitButton);

        container.appendChild(form);
        document.body.appendChild(container);

        form.addEventListener('submit', (e) => this.controller.handleFormData(e, form));
    }

    getShapeStyles(structure) {
        let styles = {
            width: "50px",
            height: "50px",
            innerText: '',
            borderRadius: "0%",
            boxShadow: "none",
            animation: "none",
            position: "relative",
            filter: "none",
        };

        switch (structure) {
            case Structures.GRAIN:
                styles.width = "20px";
                styles.height = "20px";
                styles.innerText = "K";
                styles.borderRadius = "50%";
                break;
            case Structures.ROUGH_GRAIN:
                styles.width = "60px";
                styles.height = "60px";
                styles.innerText = "GK";
                styles.borderRadius = "90%";
                styles.boxShadow = "inset 0px 0px 10px rgba(0,0,0,0.2)";
                break;
            case Structures.SMOOTH:
                styles.width = "50px";
                styles.height = "50px";
                styles.innerText = "G";
                styles.borderRadius = "5px";
                break;
            case Structures.SLIMEY:
                styles.width = "60px";
                styles.height = "30px";
                styles.innerText = "S";
                styles.borderRadius = "60%";
                styles.boxShadow = "5px 10px 20px rgba(0, 255, 0, 0.6)";
                styles.filter = "blur(2px)";
                break;
        }

        return styles;
    }

    onDragStart(e) {
        e.dataTransfer.setData("text", e.target.dataset.index);
    }

    onDragOver(e) {
        e.preventDefault();
    }

    onDrop(e) {
        e.preventDefault();
        const draggedIndex = e.dataTransfer.getData("text");
        let targetPot = e.target.closest("[data-index]");

        if (!targetPot) return;

        const targetPotIndex = targetPot.dataset.index;
        if (!this.mixingPotContents.has(targetPotIndex)) {
            this.mixingPotContents.set(targetPotIndex, []);
        }
        const potContents = this.mixingPotContents.get(targetPotIndex);
        if (potContents.length >= 8) {
            return;
        }

        const ingredient = this.controller.getIngredientByIndex(draggedIndex);
        if (!ingredient) return;

        potContents.push(ingredient);
        this.controller.removeIngredient(draggedIndex);

        this.updatePotContents(targetPot, targetPotIndex);
        this.controller.view.drawIngredients(this.controller.getIngredients());
    }

    updatePotContents(potDiv, potIndex) {
        potDiv.innerHTML = "";

        const ingredients = this.mixingPotContents.get(potIndex) || [];
        const maxPerRow = 3;
        const spacing = 4;
        const ingredientSize = 30; // Adjust based on your design

        // max aantal rijen pakken
        const numRows = Math.ceil(ingredients.length / maxPerRow);
        const potHeight = numRows * (ingredientSize + spacing) + 20; // Adding padding

        // potgroote dynamisch aanpassen
        Object.assign(potDiv.style, {
            height: `${Math.max(100, potHeight)}px`, // Minimum height of 100px
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-end",
            paddingBottom: "10px",
            overflow: "hidden",
        });

        ingredients.forEach((ingredient, index) => {
            let ingredientDiv = document.createElement("div");
            let {
                width,
                height,
                borderRadius,
                boxShadow,
                animation,
                innerText
            } = this.getShapeStyles(ingredient.structure);

            Object.assign(ingredientDiv.style, {
                width: `${ingredientSize}px`,
                height: `${ingredientSize}px`,
                borderRadius,
                boxShadow,
                animation,
                backgroundColor: ingredient.color,
                margin: `${spacing / 2}px`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "10px",
                position: "relative", // Added for tooltip positioning
            });

            ingredientDiv.innerText = innerText || '';
            ingredientDiv.setAttribute('data-mixing-speed', ingredient.mixingSpeed);
            
            // Add hover event listeners to pot ingredients as well
            ingredientDiv.addEventListener("mouseenter", this.showMixingSpeedTooltip);
            ingredientDiv.addEventListener("mouseleave", this.hideMixingSpeedTooltip);
            
            potDiv.appendChild(ingredientDiv);
        });
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

    showValidationErrors(errors, form) {
        // Remove existing error messages
        const existingErrors = form.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        // Display new error messages
        errors.forEach(error => {
            const field = form.querySelector(`#${error.field}`);
            if (field) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.color = 'red';
                errorDiv.style.fontSize = '12px';
                errorDiv.style.marginTop = '5px';
                errorDiv.textContent = error.message;
                field.parentNode.appendChild(errorDiv);
            }
        });
    }
}