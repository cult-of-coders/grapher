export default new class {
    constructor() {
        this.storage = {};
    }

    add(key, value) {
        if (this.storage[key]) {
            throw new Meteor.Error('invalid-name', `You have previously defined another namedQuery with the same name: "${key}". Named Query names should be unique.`);
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