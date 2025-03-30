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
            dropZone.textContent = "Drop mixing pot here";
            machineDiv.appendChild(dropZone);

            // Make drop zone functional
            dropZone.addEventListener("dragover", (e) => {
                this.onDragOver(e);
                dropZone.classList.add("dragover");
            });
            
            dropZone.addEventListener("dragleave", () => {
                dropZone.classList.remove("dragover");
            });
            
            dropZone.addEventListener("drop", (e) => {
                dropZone.classList.remove("dragover");
                this.onMachineDrop(e, index);
            });

            container.appendChild(machineDiv);
        });
    }

    onDragOver(e) {
        e.preventDefault();
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
}