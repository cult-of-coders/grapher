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

export class FieldMetaNode extends FieldNode {
    constructor(name, body) {
        super(name, body);
        this.body = body;
    }
}
