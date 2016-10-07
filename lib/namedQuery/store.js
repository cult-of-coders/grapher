export default new class {
    constructor() {
        this.storage = {};
    }

    add(key, value) {
        if (this.storage[key]) {
            throw new Meteor.Error(`Frozen query with key ${key} is already defined`);
        }

        this.storage[key] = value;
    }

    get(key) {
        return this.storage[key];
    }

    getAll() {
        return this.storage;
    }
}