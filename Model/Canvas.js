export default class Canvas {
    constructor(id, rows, cols) {
        this.id = id;
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createGrid(rows, cols);
    }

    createGrid(rows, cols) {
        const grid = [];
        for (let i = 0; i < rows; i++) {
            grid[i] = [];
            for (let j = 0; j < cols; j++) {
                // Generate random HSL values
                const h = Math.floor(Math.random() * 360);
                const s = Math.floor(Math.random() * 50) + 50; // 50-100%
                const l = Math.floor(Math.random() * 30) + 35; // 35-65%
                grid[i][j] = { h, s, l };
            }
        }
        return grid;
    }

    setColor(row, col, h, s, l) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return false;
        }
        if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
            return false;
        }
        this.grid[row][col] = { h, s, l };
        return true;
    }

    getColor(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.grid[row][col];
    }

    getColorAsString(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return "";
        }
        const { h, s, l } = this.grid[row][col];
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
}