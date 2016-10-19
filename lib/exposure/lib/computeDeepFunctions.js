import deepClone from '../../query/lib/deepClone';

function recursiveComputeFunctions(object, ...args) {
    _.each(object, (value, key) => {
        if (_.isFunction(value)) {
            object[key] = value.call(null, ...args);
        } else if (_.isObject(value)) {
            recursiveComputeFunctions(value, ...args);
        }
    })
}

export default (_object, ...args) => {
    let object = deepClone(_object);

    recursiveComputeFunctions(object, ...args);

    return object;
}