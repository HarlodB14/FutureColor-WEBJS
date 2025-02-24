export default class MixingPot {
    contents = [];
    MixingPot(id, contents, status) {
        this.id = id;
        this.contents = contents;
        this.status = status;
    }

    addIngredient(ingredient) {
        this.contents.push(ingredient);
    }

    getcontents() {
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

}