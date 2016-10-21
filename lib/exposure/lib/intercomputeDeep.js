import deepClone from '../../query/lib/deepClone';

/**
 * Deep Inter Computation
 */
export default function intercomputeDeep(main, second, ...args) {
    let object = {};

    _.each(main, (value, key) => {
        if (second[key] !== undefined) {
            // if the main value is a function, we run it.
            if (_.isFunction(value)) {
                value = value.call(null, ...args);
            }

            // if the main value is undefined or false, we skip the merge
            if (value === undefined || value === false) {
                return;
            }

            // if the main value is an object
            if (_.isObject(value)) {
                if (_.isObject(second[key])) {
                    // if the second one is an object as well we run recursively run the intersection
                    object[key] = intercomputeDeep(value, second[key], ...args);
                }
                // if it is not, then we will ignore it, because it won't make sense.
                // to merge {a: 1} with 1.

                return;
            }

            // if the main value is not an object, a truthy value like 1
            if (_.isObject(second[key])) {
                // if the second value is an object, then we will keep it.
                // this won't cause problem with deep nesting because
                // when you specify links you will have the main value as an object

                object[key] = deepClone(second[key]);
            } else {
                // if the second value is not an object, we just store the first value
                object[key] = value;
            }
        }
    });

    return object;
}