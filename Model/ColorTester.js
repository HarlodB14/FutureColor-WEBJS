import Canvas from './Canvas.js';

export default class ColorTester {
    constructor() {
        this.id = Date.now();
        this.canvasses = [];
    }

    createCanvas(rows, cols, id = null) {
        const canvasId = id || this.canvasses.length + 1;
        const canvas = new Canvas(canvasId, rows, cols);
        this.canvasses.push(canvas);
        return canvas;
    }

    getCanvas(id) {
        return this.canvasses.find(canvas => canvas.id === id) || null;
    }

    deleteCanvas(id) {
        const initialLength = this.canvasses.length;
        this.canvasses = this.canvasses.filter(canvas => canvas.id !== id);
        return initialLength > this.canvasses.length;
    }

    showTriadColors(color) {
        if (typeof color !== 'object' || color === null || !('h' in color)) {
            return "";
        }

        const h = color.h;
        const s = color.s;
        const l = color.l;

        // Calculate the other two colors in the triad
        const h1 = (h + 120) % 360;
        const h2 = (h + 240) % 360;

        return `Triad colors: 
                1. hsl(${h}, ${s}%, ${l}%)
                2. hsl(${h1}, ${s}%, ${l}%)
                3. hsl(${h2}, ${s}%, ${l}%)`;
    }
    
    init(containerId) {
        // Get container
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Create title
        const title = document.createElement('h2');
        title.textContent = 'Color Tester';
        container.appendChild(title);
        
        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.id = 'colorGrid';
        
        // Set grid layout with basic attributes
        gridContainer.setAttribute('style', 'display: grid; grid-template-columns: repeat(6, 40px); gap: 5px;');
        container.appendChild(gridContainer);
        
        // Create modal for color info
        const modal = document.createElement('div');
        modal.id = 'colorModal';
        modal.setAttribute('style', 'display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid black; z-index: 100;');
        document.body.appendChild(modal);
        
        // Create 36 color squares (6x6 grid)
        for (let i = 0; i < 36; i++) {
            const canvas = this.createCanvas(6, 6);
            
            // Create a color square
            const square = document.createElement('div');
            
            // Use middle cell color
            const midRow = Math.floor(canvas.rows / 2);
            const midCol = Math.floor(canvas.cols / 2);
            const color = canvas.getColor(midRow, midCol);
            const colorString = canvas.getColorAsString(midRow, midCol);
            
            // Set square color
            square.setAttribute('style', `width: 40px; height: 40px; background-color: ${colorString}; border: 1px solid #ccc; cursor: pointer;`);
            
            // Store color data
            square.dataset.h = color.h;
            square.dataset.s = color.s;
            square.dataset.l = color.l;
            
            // Add click event
            square.addEventListener('click', (e) => {
                const h = parseInt(e.target.dataset.h);
                const s = parseInt(e.target.dataset.s);
                const l = parseInt(e.target.dataset.l);
                
                this.showColorModal(modal, { h, s, l });
            });
            
            gridContainer.appendChild(square);
        }
    }
    
    showColorModal(modal, color) {
        // Clear modal
        modal.innerHTML = '';
        
        // Create close button
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.setAttribute('style', 'position: absolute; top: 5px; right: 10px; cursor: pointer; font-size: 20px;');
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        modal.appendChild(closeBtn);
        
        // Create color container
        const colorContainer = document.createElement('div');
        colorContainer.setAttribute('style', 'display: flex; gap: 15px; margin-top: 10px;');
        
        // Create the triad colors with the main color in the middle
        const colors = [
            { h: (color.h + 240) % 360, s: color.s, l: color.l }, // Third color (240° from main)
            { h: color.h, s: color.s, l: color.l },               // Main color in the middle
            { h: (color.h + 120) % 360, s: color.s, l: color.l }  // Second color (120° from main)
        ];
        
        // Add color blocks
        colors.forEach(c => {
            const colorBlock = document.createElement('div');
            colorBlock.setAttribute('style', 'text-align: center;');
            
            // Color swatch
            const swatch = document.createElement('div');
            swatch.setAttribute('style', `width: 60px; height: 60px; background-color: hsl(${c.h}, ${c.s}%, ${c.l}%); border: 1px solid #ccc; margin-bottom: 5px;`);
            
            // Color code
            const code = document.createElement('div');
            code.setAttribute('style', 'font-size: 12px; word-break: break-all;');
            code.textContent = `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
            
            colorBlock.appendChild(swatch);
            colorBlock.appendChild(code);
            colorContainer.appendChild(colorBlock);
        });
        
        modal.appendChild(colorContainer);
        modal.style.display = 'block';
    }
}