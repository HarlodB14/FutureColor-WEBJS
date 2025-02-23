import CreateInput from "../Helpers/CreateInput.js";

export default class MixingHallView {
    constructor(mixingHallController) {
        this.mixingHallController = mixingHallController;
    }

    draw(structures) {
        const container = document.createElement('div');
        container.className = 'formContainer';
        const form = document.createElement('form');
        form.className = 'ingredient-form';

        const structureLabel = document.createElement('label');
        structureLabel.setAttribute('for', 'structureSelect');
        structureLabel.textContent = 'Structuur';
        form.appendChild(structureLabel);

        let structureSelect = document.createElement('select');
        structureSelect.name = 'structure';
        structureSelect.id = 'structureSelect';

        structures.forEach((structure) => {
            let option = document.createElement('option');
            option.value = structure;
            option.textContent = structure;
            structureSelect.appendChild(option);
        });

        form.appendChild(structureSelect);

        let createInput = new CreateInput();
        form.appendChild(createInput.createInputField('mengtijd in milliseconden', 'amountOfMixingTime', 'number'));
        form.appendChild(createInput.createInputField('mengsnelheid', 'mixingSpeed', 'number'));
        form.appendChild(createInput.createInputField('Kleur(HSL)', 'color', 'text'));

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Ingrediënt aanmaken';
        form.appendChild(submitButton);

        container.appendChild(form);
        document.body.appendChild(container);

        form.addEventListener('submit', (e) => this.mixingHallController.handleFormData(e, form));
    }
}