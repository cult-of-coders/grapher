function deepCloneArray(array) {
    return _.map(array, value => {
        if (_.isArray(value)) {
            return deepCloneArray(array);
        } else if (_.isFunction(value)) {
            return value;
        } else if (_.isObject(value)) {
            return deepClone(value);
        }

        return value;
    })
}

export default function deepClone(object) {
    let clone = {};

    _.each(object, (value, key) => {
        if (_.isArray(value)) {
            clone[key] = deepCloneArray(value);
        } else if (_.isFunction(value)) {
            clone[key] = value;
        } else if (_.isRegExp(value)) {
            clone[key] = value;
        } else if (_.isDate(value)) {
            clone[key] = value;
        } else if (_.isObject(value)) {
            clone[key] = deepClone(value);
        } else {
            clone[key] = value;
        }
    });

    return clone;
}
