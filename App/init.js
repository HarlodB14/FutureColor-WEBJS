import MixingHallController from '../Controller/MixingHallController.js';
import ColorTester from '../Model/ColorTester.js';

// Initialize the mixing hall controller
const controller = new MixingHallController();
controller.drawIngredientForm();

// Initialize the color tester
document.addEventListener('DOMContentLoaded', () => {
    // Create a container for the color tester
    const container = document.createElement('div');
    container.id = 'colorTesterContainer';
    document.body.appendChild(container);
    
    // Add a simple divider
    const divider = document.createElement('hr');
    document.body.insertBefore(divider, container);
    
    // Initialize the color tester
    const colorTester = new ColorTester();
    colorTester.init('colorTesterContainer');
});