export default function deepClone(object) {
    let clone = {};

    _.each(object, (value, key) => {
        if (_.isFunction(value) || _.isArray(value)) {
            clone[key] = value;
        } else if (_.isObject(value)) {
            clone[key] = deepClone(value);
        } else {
            clone[key] = value;
        }
    });

    return clone;
}