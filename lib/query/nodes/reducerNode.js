export default class ReducerNode {
    constructor(name, {body, reduce}) {
        this.name = name;
        this.body = body;
        this.reduceFunction = reduce;
    }

    compute(object) {
        object[this.name] = this.reduce(object);
    }

    reduce(object) {
        return this.reduceFunction.call(null, object);
    }
}