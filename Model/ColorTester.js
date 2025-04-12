export default class ColorTester {
    constructor(controller) {
        this.controller = controller;
        this.id = Date.now();
        this.rows = 4;
        this.cols = 4;
        this.grid = this.createEmptyGrid(this.rows, this.cols);
    }

    createEmptyGrid(rows, cols) {
        const grid = [];
        for (let i = 0; i < rows; i++) {
            grid[i] = [];
            for (let j = 0; j < cols; j++) {
                grid[i][j] = null; // Empty cells
            }
        }
        return grid;
    }

    setColor(row, col, color) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return false;
        }
        this.grid[row][col] = color;
        return true;
    }

    getColor(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.grid[row][col];
    }

    getColorCodeAt(row, col) {
        const color = this.getColor(row, col);
        return color || "#ffffff"; // Return white for empty cells
    }

    clearGrid() {
        this.grid = this.createEmptyGrid(this.rows, this.cols);
    }

    resizeGrid(rows, cols) {
        // Validate input
        if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1 || rows > 10 || cols > 10) {
            return false;
        }
        
        // Create a new grid with the desired dimensions
        const newGrid = this.createEmptyGrid(rows, cols);
        
        // Copy over existing colors where possible
        for (let i = 0; i < Math.min(this.rows, rows); i++) {
            for (let j = 0; j < Math.min(this.cols, cols); j++) {
                newGrid[i][j] = this.grid[i][j];
            }
        }
        
        // Update grid properties
        this.rows = rows;
        this.cols = cols;
        this.grid = newGrid;
        return true;
    }
    
    // Method to parse HSL color string
    parseHslColor(hslStr) {
        const regex = /hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i;
        const match = hslStr.match(regex);
        
        if (match) {
            return {
                h: parseInt(match[1], 10),
                s: parseInt(match[2], 10),
                l: parseInt(match[3], 10)
            };
        }
        
        return null;
    }
    
    drawGrid(container) {
        // Clear existing grid
        container.innerHTML = '';
    
        // Create grid header
        const gridHeader = document.createElement('h3');
        gridHeader.textContent = 'Kleurtester';
        gridHeader.className = 'color-tester-header';
        container.appendChild(gridHeader);
        
        // Create the controls container first (at the top)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'grid-controls';
        
        // Add row and column inputs
        const rowsLabel = document.createElement('label');
        rowsLabel.textContent = 'Rijen:';
        rowsLabel.className = 'grid-input-label';
        
        const rowsInput = document.createElement('input');
        rowsInput.type = 'number';
        rowsInput.min = '1';
        rowsInput.max = '10';
        rowsInput.value = this.rows;
        rowsInput.className = 'grid-size-input';
        
        const colsLabel = document.createElement('label');
        colsLabel.textContent = 'Kolommen:';
        colsLabel.className = 'grid-input-label';
        
        const colsInput = document.createElement('input');
        colsInput.type = 'number';
        colsInput.min = '1';
        colsInput.max = '10';
        colsInput.value = this.cols;
        colsInput.className = 'grid-size-input';
        
        // Apply button to update grid dimensions
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Toepassen';
        applyButton.className = 'grid-button apply-button';
        applyButton.addEventListener('click', () => {
            const newRows = parseInt(rowsInput.value, 10);
            const newCols = parseInt(colsInput.value, 10);
            
            if (this.resizeGrid(newRows, newCols)) {
                this.drawGrid(container);
            } else {
                alert('Vul een getal tussen 1 en 10 in voor rijen en kolommen.');
            }
        });
        
        // Clear grid button
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Grid Wissen';
        clearButton.className = 'grid-button clear-button';
        clearButton.addEventListener('click', () => {
            this.clearGrid();
            this.drawGrid(container);
        });
        
        // Add everything to controls container
        controlsContainer.appendChild(rowsLabel);
        controlsContainer.appendChild(rowsInput);
        controlsContainer.appendChild(colsLabel);
        controlsContainer.appendChild(colsInput);
        controlsContainer.appendChild(applyButton);
        controlsContainer.appendChild(clearButton);
        
        container.appendChild(controlsContainer);
    
        // Create grid container with data attributes for rows and cols
        const gridContainer = document.createElement('div');
        gridContainer.className = 'color-grid-container';
        // Set grid template in CSS class instead of inline styles
        gridContainer.setAttribute('data-rows', this.rows);
        gridContainer.setAttribute('data-cols', this.cols);
    
        // Create grid cells
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                
                if (this.grid[i][j]) {
                    cell.style.backgroundColor = this.grid[i][j]; // This is acceptable as it's dynamic content
                    
                    // Add click handler to show color info for existing colors
                    cell.onclick = (e) => {
                        const colorObj = this.parseHslColor(this.grid[i][j]);
                        if (colorObj) {
                            this.showColorInfo(colorObj, cell, e);
                        }
                    };
                }
                
                // Setup drop event handling
                cell.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    cell.classList.add('dragover');
                });
                
                cell.addEventListener('dragleave', () => {
                    cell.classList.remove('dragover');
                });
                
                cell.addEventListener('drop', (e) => {
                    e.preventDefault();
                    cell.classList.remove('dragover');
                    
                    // Get the color data from the dragged item
                    const color = e.dataTransfer.getData('text/plain');
                    if (color) {
                        // Update the grid data
                        this.grid[i][j] = color;
                        
                        // Update the cell appearance
                        cell.style.backgroundColor = color; // Dynamic content, acceptable inline style
                        
                        // Add click handler to show color info
                        cell.onclick = (e) => {
                            // Parse the HSL color
                            const colorObj = this.parseHslColor(color);
                            if (colorObj) {
                                this.showColorInfo(colorObj, cell, e);
                            }
                        };
                    }
                });
                
                gridContainer.appendChild(cell);
            }
        }
        
        container.appendChild(gridContainer);
    }
    
    showColorInfo(color, element, event) {
        // Create or get color info modal
        let colorModal = document.getElementById('colorInfoModal');
        if (!colorModal) {
            colorModal = document.createElement('div');
            colorModal.id = 'colorInfoModal';
            colorModal.className = 'color-info-modal';
            
            document.body.appendChild(colorModal);
        }
        
        // Clear previous content
        colorModal.innerHTML = '';
        
        // Create close button
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.className = 'modal-close-btn';
        closeBtn.onclick = () => { colorModal.style.display = 'none'; };
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Kleurinformatie';
        title.className = 'modal-title';
        
        // Create the color swatch
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`; // Dynamic content
        
        // Create the HSL value display
        const hslValue = document.createElement('p');
        hslValue.className = 'hsl-value';
        hslValue.textContent = `HSL: ${color.h}, ${color.s}%, ${color.l}%`;
        
        // Create triad colors container
        const triadContainer = document.createElement('div');
        triadContainer.className = 'triad-container';
        
        // Calculate triad colors - putting the selected color in the middle
        const colors = [
            { h: (color.h + 240) % 360, s: color.s, l: color.l }, // First triad color (-120°)
            { h: color.h, s: color.s, l: color.l },               // Original color in the middle
            { h: (color.h + 120) % 360, s: color.s, l: color.l }  // Second triad color (+120°)
        ];
        
        // Add triad color swatches
        colors.forEach((c, index) => {
            const colorBlock = document.createElement('div');
            colorBlock.className = 'triad-color-block';
            
            if (index === 1) {
                colorBlock.classList.add('triad-original-color');
            }
            
            const triadSwatch = document.createElement('div');
            triadSwatch.className = 'triad-swatch';
            triadSwatch.style.backgroundColor = `hsl(${c.h}, ${c.s}%, ${c.l}%)`; // Dynamic content
            
            const triadLabel = document.createElement('div');
            triadLabel.className = 'triad-label';
            
            // For the triad colors (not the original), show HSL values
            if (index !== 1) {
                const hslText = document.createElement('div');
                hslText.textContent = `HSL: ${c.h}°, ${c.s}%, ${c.l}%`;
                hslText.className = 'triad-hsl-text';
                
                triadLabel.appendChild(hslText);
            } else {
                triadLabel.textContent = `${c.h}°`;
            }
            
            colorBlock.appendChild(triadSwatch);
            colorBlock.appendChild(triadLabel);
            triadContainer.appendChild(colorBlock);
        });
        
        // Add everything to the modal
        colorModal.appendChild(closeBtn);
        colorModal.appendChild(title);
        colorModal.appendChild(swatch);
        colorModal.appendChild(hslValue);
        colorModal.appendChild(document.createElement('hr'));
        
        const triadTitle = document.createElement('h4');
        triadTitle.textContent = 'Triade Kleuren';
        triadTitle.className = 'triad-title';
        colorModal.appendChild(triadTitle);
        
        colorModal.appendChild(triadContainer);
        
        // Calculate position above the clicked element
        const rect = element.getBoundingClientRect();
        
        // Position the modal above the clicked element
        const modalHeight = 280; // Estimated modal height, adjust as needed
        let topPosition = rect.top - modalHeight - 10; // 10px gap
        
        // If there's not enough space above, position it below
        if (topPosition < 0) {
            topPosition = rect.bottom + 10; // 10px gap
        }
        
        // Center horizontally above/below the cell
        const leftPosition = rect.left + (rect.width / 2) - 125; // Assuming modal width is ~250px
        
        // Apply the position
        colorModal.style.position = 'fixed';
        colorModal.style.top = `${topPosition}px`;
        colorModal.style.left = `${Math.max(10, Math.min(window.innerWidth - 260, leftPosition))}px`;
        colorModal.style.zIndex = '9999';
        
        // Show the modal
        colorModal.style.display = 'block';
        
        // Prevent clicks from propagating to elements below the modal
        colorModal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}