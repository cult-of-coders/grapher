export default class FieldNode {
    constructor(name, body) {
        this.name = name;
        this.body = _.isObject(body) ? 1 : body;
        this.scheduledForDeletion = false;
    }

    applyFields(fields) {
        fields[this.name] = this.body;
    }
}