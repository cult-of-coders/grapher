export default class FieldNode {
    constructor(name, body, isProjectionOperator = false) {
        this.name = name;
        this.projectionOperator = isProjectionOperator ? _.keys(body)[0] : null;
        this.body = !_.isObject(body) || isProjectionOperator ? body : 1;
        this.scheduledForDeletion = false;
    }

    applyFields(fields) {
        fields[this.name] = this.body;
    }
}
