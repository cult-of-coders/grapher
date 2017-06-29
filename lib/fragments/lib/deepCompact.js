import isEmptyObject from './isEmptyObject';

/**
 * Removes all falsy keys from an object.
 *
 * @example
 * const obj = {
 *  shallow: 0,
 *  shallowTrue: 1,
 *  nested: {
 *   deep: 0
 *  }
 * }
 *
 * // result: { shallowTrue: 1 }
 *
 * @param {*} object
 */
const deepCompact = (object) => {
    _.each(object, (value, key) => {
        // don't touch special fields
        if (key[0] === '$') return;

        if (!value) {
            delete(object[key]);
        } else {
            // if an empty object is already in this query, it came from a fragment or the user
            if (_.isObject(value) && !isEmptyObject(value)) {
                deepCompact(value);

                // IMPORTANT: If an object loses all of its keys, then the node is removed
                // from the root object in order to prevent unwanted data leakage, because
                // { key: { } } will include all data underneath key when the query is run.
                if (isEmptyObject(value)) {
                    delete(object[key]);
                }
            }
        }
    });

    return object;
};

export default deepCompact;
