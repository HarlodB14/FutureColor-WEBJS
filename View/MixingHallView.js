import CreateInput from "../Helpers/CreateInput.js";
import Structures from "../Enums/Structures.js";

export default class MixingHallView {
    constructor(controller) {
        this.controller = controller;
    }

    drawAddPotButton() {
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

        let button = document.createElement("button");
        button.id = "addNewMixingPot";
        button.textContent = "Mengpot toevoegen";
        button.style.padding = "10px 15px";
        button.style.fontSize = "16px";
        button.style.cursor = "pointer";
        button.style.border = "none";
        button.style.backgroundColor = "#4CAF50";
        button.style.color = "white";
        button.style.borderRadius = "5px";
        button.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";

        button.addEventListener("click", () => this.controller.createMixingPot());

        buttonContainer.innerHTML = "";
        buttonContainer.appendChild(button);
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

        container.innerHTML = ''; // Reset de container

        mixingPots.forEach((pot, index) => {
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
                cursor: "move", // Voeg cursor toe voor slepen
            });

            potDiv.draggable = true;
            potDiv.setAttribute('data-index', index);

            potDiv.addEventListener("dragstart", (e) => this.onDragStart(e));
            potDiv.addEventListener("dragover", (e) => this.onDragOver(e));
            potDiv.addEventListener("drop", (e) => this.onDrop(e));

            container.appendChild(potDiv);
        });
    }

    drawIngredients(ingredients) {
        let areaContainer = document.getElementById("mixingAreaContainer");
        if (!areaContainer) {
            this.drawMixingPots([]);
            areaContainer = document.getElementById("mixingAreaContainer");
        }

        let container = document.getElementById("ingredientsContainer");
        if (!container) {
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
        }

        container.innerHTML = ''; // Reset de container

        ingredients.forEach((ingredient, index) => {
            let ingredientDiv = document.createElement("div");
            let { width, height, borderRadius, boxShadow, animation, innerText } = this.getShapeStyles(ingredient.structure);

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
        const targetElement = e.target;

    }
}