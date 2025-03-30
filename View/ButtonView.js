export default class ButtonView {
    constructor(controller) {
        this.controller = controller;
    }

    drawButtonContainer() {
        let rightContainer = document.getElementById("rightContainer");
        if (!rightContainer) {
            return; // The container should already exist from setupLayout
        }

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
    }
}