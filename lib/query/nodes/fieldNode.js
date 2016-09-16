export default class FieldNode {
    constructor(name, body) {
        this.name = name;
        this.body = body;
    }

    isGlobal() {
        return this.name === '$all';
    }

    applyFields(fields) {
        fields[this.name] = this.body;
    }
}