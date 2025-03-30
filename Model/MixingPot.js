import MixingPotStatus from "../Enums/MixingPotStatus.js";

export default class MixingPot {
    constructor() {
        this.id = null;
        this.contents = [];
        this.status = MixingPotStatus.EMPTY;
    }

    addIngredient(ingredient) {
        this.contents.push(ingredient);
        this.status = MixingPotStatus.FILLED;
    }

    getContents() {
        return this.contents;
    }

    getStatus() {
        return this.status;
    }
    
    setStatus(status) {
        this.status = status;
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
    }

    isEmpty() {
        return this.contents.length === 0;
    }
    
    // Clear the pot contents
    clear() {
        this.contents = [];
        this.status = MixingPotStatus.EMPTY;
    }
}