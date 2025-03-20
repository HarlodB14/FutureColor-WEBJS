import CreateInput from "../Helpers/CreateInput.js";
import Colors from "../Enums/Colors.js";

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
        
        // Create color selection container
        const colorContainer = document.createElement('div');
        colorContainer.style.marginBottom = '15px';
        
        // Create color input field with the color picker directly after it
        const colorFieldContainer = createInput.createInputField('Kleur(HSL)', 'color', 'text');
        
        // Add HTML color picker right after the input field
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.id = 'colorPicker';
        colorPicker.style.marginLeft = '10px';
        colorPicker.style.verticalAlign = 'middle';
        
        // Find the input element within the container and add the color picker after it
        const colorInput = colorFieldContainer.querySelector('input');
        if (colorInput) {
            colorInput.parentNode.insertBefore(colorPicker, colorInput.nextSibling);
        }
        
        // Convert the color picker's hex value to HSL
        colorPicker.addEventListener('input', function() {
            const hexColor = this.value;
            const hslColor = hexToHSL(hexColor);
            document.getElementById('color').value = hslColor;
        });
        
        colorContainer.appendChild(colorFieldContainer);
        form.appendChild(colorContainer);

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
    }
}