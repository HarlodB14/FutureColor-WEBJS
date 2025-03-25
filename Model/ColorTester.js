import Canvas from './Canvas.js';

export default class ColorTester {
    constructor() {
        this.id = Date.now();
        this.canvasses = [];
        this.rows = 6;
        this.cols = 6;
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
        
        // Add resize event listener to handle viewport changes
        window.addEventListener('resize', () => {
            this.updateGrid();
        });
        
        // Create grid controls
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'gridControls';
        controlsContainer.style.marginBottom = '15px';
        
        // Rows input
        const rowsLabel = document.createElement('label');
        rowsLabel.textContent = 'Rows: ';
        rowsLabel.setAttribute('for', 'rowsInput');
        
        const rowsInput = document.createElement('input');
        rowsInput.type = 'number';
        rowsInput.id = 'rowsInput';
        rowsInput.min = '1';
        rowsInput.max = '10';
        rowsInput.value = this.rows;
        rowsInput.style.width = '50px';
        rowsInput.style.marginRight = '15px';
        
        // Columns input
        const colsLabel = document.createElement('label');
        colsLabel.textContent = 'Columns: ';
        colsLabel.setAttribute('for', 'colsInput');
        
        const colsInput = document.createElement('input');
        colsInput.type = 'number';
        colsInput.id = 'colsInput';
        colsInput.min = '1';
        colsInput.max = '10';
        colsInput.value = this.cols;
        colsInput.style.width = '50px';
        colsInput.style.marginRight = '15px';
        
        // Update button
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update Grid';
        updateButton.style.padding = '5px 10px';
        
        // Add event listener for the update button
        updateButton.addEventListener('click', () => {
            const newRows = parseInt(rowsInput.value, 10);
            const newCols = parseInt(colsInput.value, 10);
            
            // Validate input
            if (newRows >= 1 && newRows <= 10 && newCols >= 1 && newCols <= 10) {
                this.rows = newRows;
                this.cols = newCols;
                this.updateGrid();
            } else {
                alert('Please enter values between 1 and 10 for rows and columns.');
            }
        });
        
        // Append controls to container
        controlsContainer.appendChild(rowsLabel);
        controlsContainer.appendChild(rowsInput);
        controlsContainer.appendChild(colsLabel);
        controlsContainer.appendChild(colsInput);
        controlsContainer.appendChild(updateButton);
        container.appendChild(controlsContainer);
        
        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.id = 'colorGrid';
        container.appendChild(gridContainer);
        
        // Create modal for color info
        const modal = document.createElement('div');
        modal.id = 'colorModal';
        modal.setAttribute('style', 'display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid black; z-index: 100;');
        document.body.appendChild(modal);
        
        // Initialize the grid
        this.updateGrid();
    }
    
    updateGrid() {
        // Get the grid container
        const gridContainer = document.getElementById('colorGrid');
        if (!gridContainer) return;
        
        // Clear existing grid
        gridContainer.innerHTML = '';
        this.canvasses = [];
        
        // Calculate grid size based on 30% of viewport height
        // Use the same value for width to make a perfect square
        const gridSize = Math.floor(window.innerHeight * 0.3);
        
        const gap = 5;
        
        // Calculate cell size based on the grid dimensions and available space
        const cellSize = Math.floor((gridSize - (Math.max(this.rows, this.cols) - 1) * gap) / Math.max(this.rows, this.cols));
        
        // Calculate the actual grid dimensions
        const actualGridWidth = this.cols * cellSize + (this.cols - 1) * gap;
        const actualGridHeight = this.rows * cellSize + (this.rows - 1) * gap;
        
        // Set grid layout with calculated attributes
        gridContainer.setAttribute('style', 
            `display: grid; 
             grid-template-columns: repeat(${this.cols}, ${cellSize}px); 
             gap: ${gap}px; 
             width: ${actualGridWidth}px;
             height: ${actualGridHeight}px;
             max-width: ${gridSize}px;
             max-height: ${gridSize}px;
             aspect-ratio: 1/1;
             margin: 0 auto;`);
        
        // Create color squares based on rows and columns
        const totalSquares = this.rows * this.cols;
        for (let i = 0; i < totalSquares; i++) {
            const canvas = this.createCanvas(this.rows, this.cols);
            
            // Create a color square
            const square = document.createElement('div');
            
            // Use middle cell color
            const midRow = Math.floor(canvas.rows / 2);
            const midCol = Math.floor(canvas.cols / 2);
            const color = canvas.getColor(midRow, midCol);
            const colorString = canvas.getColorAsString(midRow, midCol);
            
            // Set square color
            square.setAttribute('style', `width: ${cellSize}px; height: ${cellSize}px; background-color: ${colorString}; border: 1px solid #ccc; cursor: pointer;`);
            
            // Store color data
            square.dataset.h = color.h;
            square.dataset.s = color.s;
            square.dataset.l = color.l;
            
            // Add click event
            square.addEventListener('click', (e) => {
                const h = parseInt(e.target.dataset.h);
                const s = parseInt(e.target.dataset.s);
                const l = parseInt(e.target.dataset.l);
                
                this.showColorModal(document.getElementById('colorModal'), { h, s, l });
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