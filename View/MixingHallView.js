import CreateInput from "../Helpers/CreateInput.js";
import Colors from "../Enums/Colors.js";
import Structures from "../Enums/Structures.js";

export default class MixingHallView {
    constructor(controller) {
        this.mixingPotContents = new Map();
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

        form.addEventListener('submit', (e) => this.mixingHallController.handleFormData(e, form));
        
        // Helper function to convert hex to HSL
        function hexToHSL(hex) {
            // Remove the # if present
            hex = hex.replace(/^#/, '');
            
            // Convert hex to RGB
            let r = parseInt(hex.substring(0, 2), 16) / 255;
            let g = parseInt(hex.substring(2, 4), 16) / 255;
            let b = parseInt(hex.substring(4, 6), 16) / 255;
            
            // Find the min and max values to calculate the luminance
            let max = Math.max(r, g, b);
            let min = Math.min(r, g, b);
            let l = (max + min) / 2;
            let s = 0;
            let h = 0;
            
            if (max !== min) {
                // Calculate saturation
                s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
                
                // Calculate hue
                if (max === r) {
                    h = (g - b) / (max - min) + (g < b ? 6 : 0);
                } else if (max === g) {
                    h = (b - r) / (max - min) + 2;
                } else if (max === b) {
                    h = (r - g) / (max - min) + 4;
                }
                h = Math.round(h * 60);
            }
            
            // Round values and format as hsl string
            s = Math.round(s * 100);
            l = Math.round(l * 100);
            
            return `hsl(${h}, ${s}%, ${l}%)`;
        }
        
        // Helper function to convert HSL to hex (approximate) - kept for potential future use
        function hslToHex(hsl) {
            // Parse HSL values
            const match = hsl.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
            
            if (!match) return '#000000';
            
            let h = parseInt(match[1]) / 360;
            let s = parseInt(match[2]) / 100;
            let l = parseInt(match[3]) / 100;
            
            // Algorithm to convert HSL to RGB
            let r, g, b;
            
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            // Convert RGB to hex
            const toHex = (x) => {
                const hex = Math.round(x * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
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