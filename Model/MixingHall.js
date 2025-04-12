export default class MixingHall {
    constructor() {
        this.id = null;
        this.mixMachines = [];
        this.status = null;
    }

    addMixingMachine(mixingMachine) {
        this.mixMachines.push(mixingMachine);
    }

    getMixMachines() {
        return this.mixMachines;
    }

    getId() {
        return this.id;
    }
    
    setId(id) {
        this.id = id;
    }
    
    getStatus() {
        return this.status;
    }
    
    setStatus(status) {
        this.status = status;
    }
}