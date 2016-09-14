export default class FieldNode {
    constructor(name, body) {
        this.name = name;
        this.body = body;
    }

    applyFields(fields) {
        fields[this.name] = this.body;
    }
}