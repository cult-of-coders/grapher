export default class ReducerNode {
    constructor(name, body, reducer) {
        this.name = name;
        this.body = body;
        this.reducer = reducer;

        // reducer nodes should always be added last.

        // store fields that are needed, but not specified are fields
        // so when we prepare data for delivery it we can clean-it-up
    }

    applyFields(fields) {
        // fields[this.name] = this.body;
    }
}