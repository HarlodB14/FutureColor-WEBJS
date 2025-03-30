import MixingMachineStatus from "../Enums/MixingHallStatus";
export default class MixMachine {
    pot_contents = [];

    MixMachine(id, pot_contents, mixingSpeed, mixingTime, status) {
        this.id = id;
        this.pot_contents = pot_contents;
        this.mixingSpeed = mixingSpeed;
        this.mixingTime = mixingTime;
        this.status = status;
        status = MixingMachineStatus.EMPTY;
    }

    addPot(mixingpot) {
        this.pot_contents.push(mixingpot);
    }
    removePot(finishedPot) {
        this.pot_contents.splice(finishedPot);
    }



}