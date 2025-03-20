export default class CreateInput {
    createInputField(labelText, id, type) {
        const fieldContainer = document.createElement('div');
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = labelText;
        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.required = true;
        fieldContainer.appendChild(label);
        fieldContainer.appendChild(input);
        return fieldContainer;
    }
}