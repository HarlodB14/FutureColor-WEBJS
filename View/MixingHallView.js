import CreateInput from "../Helpers/CreateInput.js";
import Structures from "../Enums/Structures.js";

export default class MixingHallView {
    constructor(controller) {
        this.mixingPotContents = new Map();
        this.controller = controller;
    }

    drawButtonContainer() {
        let buttonContainer = document.getElementById("addPotButtonContainer");
        if (!buttonContainer) {
            buttonContainer = document.createElement("div");
            buttonContainer.id = "addPotButtonContainer";
            buttonContainer.style.position = "fixed";
            buttonContainer.style.top = "20px";
            buttonContainer.style.right = "20px";
            buttonContainer.style.zIndex = "1000";
            document.body.appendChild(buttonContainer);
        }

        // Clear existing buttons
        buttonContainer.innerHTML = "";

        // Button to add a new mixing pot
        let addPotButton = document.createElement("button");
        addPotButton.id = "addNewMixingPot";
        addPotButton.textContent = "Mengpot toevoegen";
        Object.assign(addPotButton.style, this.getButtonStyles());

        addPotButton.addEventListener("click", () => this.controller.createMixingPot());
        let addMachineButton = document.createElement("button");
        addMachineButton.id = "addNewMixingMachine";
        addMachineButton.textContent = "Mixmachine toevoegen";
        Object.assign(addMachineButton.style, this.getButtonStyles());
        addMachineButton.addEventListener("click", () => this.controller.createMixingMachine());

        buttonContainer.appendChild(addPotButton);
        buttonContainer.appendChild(addMachineButton);
    }

    getButtonStyles() {
        return {
            padding: "10px 15px",
            fontSize: "16px",
            cursor: "pointer",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "white",
            borderRadius: "5px",
            boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
            marginBottom: "10px",
            display: "block",
            width: "200px",
        };
    }
    drawMixingMachines(mixingMachines) {
        let areaContainer = document.getElementById("machineAreaContainer");
        if (!areaContainer) {
            areaContainer = document.createElement("div");
            areaContainer.id = "machineAreaContainer";
            document.body.appendChild(areaContainer);

            Object.assign(areaContainer.style, {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px",
                backgroundColor: "transparent",
                width: "100%",
                minHeight: "100vh",
                boxSizing: "border-box",
                overflowX: "hidden"
            });
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
                width: "80%",
                maxWidth: "300px"
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
                width: "250px",
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
                boxSizing: "border-box"
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
            areaContainer = document.createElement("div");
            areaContainer.id = "mixingAreaContainer";
            document.body.appendChild(areaContainer);

            Object.assign(areaContainer.style, {
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "40px",
                marginTop: "20px",
                padding: "10px",
            });
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
            this.drawMixingPots([]);
            areaContainer = document.getElementById("mixingAreaContainer");
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
            });

            ingredientDiv.draggable = true;
            ingredientDiv.setAttribute('data-index', index);

            ingredientDiv.addEventListener("dragstart", (e) => this.onDragStart(e));
            ingredientDiv.addEventListener("dragover", (e) => this.onDragOver(e));
            ingredientDiv.addEventListener("drop", (e) => this.onDrop(e));

            ingredientDiv.innerText = innerText || '';
            container.appendChild(ingredientDiv);
        });
    }

    drawIngredientForm() {
        const container = document.createElement('div');
        container.className = 'formContainer';
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
            });

            ingredientDiv.innerText = innerText || '';
            potDiv.appendChild(ingredientDiv);
        });
    }
}