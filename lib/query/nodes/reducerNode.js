export default class ReducerNode {
    constructor(name, {body, reduce, expand}) {
        this.name = name;
        this.body = body;
        this.reduceFunction = reduce;
        this.dependencies = []; // This is a list of the reducer this reducer uses.

        this.isExpander = Boolean(expand);
    }

    /**
     * When computing we also pass the parameters
     * 
     * @param {*} object 
     * @param {*} args 
     */
    async compute(object, ...args) {
        if (this.isExpander) {
            return;
        }

        object[this.name] = await this.reduce.call(this, object, ...args);
    }

    async reduce(object, ...args) {
        return await this.reduceFunction.call(this, object, ...args);
    }
}