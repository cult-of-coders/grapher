/**
 * When you work with add/remove set/unset
 * You have the ability to pass strings, array of strings, objects, array of objects
 * If you are adding something and you want to save them in db, you can pass objects without ids.
 */
export default new class {
    getIds(what, options) {
        if (Array.isArray(what)) {
            return _.map(what, (subWhat) => {
                return this.getId(subWhat, options);
            }).filter(id => typeof id === 'string');
        } else {
            return [this.getId(what, options)].filter(id => typeof id === 'string');
        }
    }

    getId(what, options) {
        if (typeof what === 'string') {
            return what;
        }

        if (_.isObject(what)) {
            if (!what._id && options.saveToDatabase) {
                what._id = options.collection.insert(what);
            }

            return what._id
        }
    }
}
