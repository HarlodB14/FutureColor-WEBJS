export default class MixingHall {
    mixMachines = [];
    mixingPots = [];
    ingredients = [];

    MixingHall(id, mixMachines, mixingPots, ingredients, status) {
        this.id = id;
        this.mixMachines = mixMachines;
        if (mixMachines != null) {
            this.status = RUNNING;
        }
        this.mixingPots = mixingPots;
        this.ingredients = ingredients;
        this.status = status;
    }

    addMixingMachine(mixingMachine) {
        this.mixMachines.push(mixingMachine);
    }

    addIngredient(ingredient) {
        this.ingredients.push(ingredient);
    }

    removeIngredient(index) {
        if (index >= 0 && index < this.ingredients.length) {
            this.ingredients.splice(index, 1);
        }
    }


    addMixingPot(mixingPot) {
        this.mixingPots.push(mixingPot);
    }

    getIngredients() {
        return this.ingredients;
    }

    getMixMachine() {
        return this.mixMachines;
    }

    getMixingPots() {
        return this.mixingPots;
    }

    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }


}