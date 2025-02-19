export default class Ingredient {
    constructor(amountOfMixingTime, mixingSpeed, color, structure) {
        this.amountOfMixingTime = amountOfMixingTime;
        this.mixingSpeed = mixingSpeed;
        this.color = color;
        this.structure = structure;
    }

    getAmountOfMixingTime() {
        return this.amountOfMixingTime;
    }

    setAmountOfMixingTime(amount) {
        this.amountOfMixingTime = amount;
    }

    getMixingSpeed() {
        return this.mixingSpeed;
    }

    setMixingSpeed(speed) {
        this.mixingSpeed = speed;
    }

    getColor() {
        return this.color;
    }

    setColor(color) {
        this.color = color;
    }

    getStructure() {
        return this.structure;
    }

    setStructure(structure) {
        this.structure = structure;
    }
}