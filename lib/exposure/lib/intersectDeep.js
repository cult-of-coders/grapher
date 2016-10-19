import deepClone from '../../query/lib/deepClone';

/**
 * Given to objects, it will intersect what they have in common.
 *
 * It will favor objects on intersection meaning: { item: 1 } INTERSECT { item: { anything } } => { item: { anything } }
 *
 * @param first Object
 * @param second Object
 */
export default function intersectDeep(first, second) {
    let object = {};
    _.each(first, (value, key) => {
        if (value === undefined || value === false) {
            return;
        }

        if (second[key] !== undefined) {
            if (_.isObject(value)) {
                if (_.isObject(second[key])) {
                    object[key] = intersectDeep(value, second[key]);
                } else {
                    object[key] = deepClone(value);
                }
            } else {
                if (_.isObject(second[key])) {
                    object[key] = deepClone(second[key]);
                } else {
                    object[key] = value;
                }
            }
        }
    });

    return object;
}