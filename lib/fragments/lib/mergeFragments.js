import isEmptyObject from './isEmptyObject';

/**
 * Deep merges two fragments together. Similar to deepMerge, but prioritizes empty objects.
 *
 * @example
 * // returns { key: { } }
 * merge({ key: { } }, { key: { subkey: 1 } });
 *
 * @param {*} target
 * @param {*} source
 */
const merge = (target, source) => {
    if (_.isObject(target) && _.isObject(source)) {
        _.each(source, (value, key) => {
            // short circuit
            if (isEmptyObject(target[key])) return;

            if (key === '$fragments' || _.isArray(value)) {
                // TODO: deep merge arrays (e.g. $and)
                // merge
                target[key] = _.uniq([
                    ...(target[key] || []),
                    ...(source[key] || [])
                ]);
                return;
            }

            if (_.isObject(source[key])) {
                if (isEmptyObject(source[key])) {
                    target[key] = {};
                    return;
                } else {
                    if (!target[key]) {
                        Object.assign(target, { [key]: {} });
                    }

                    merge(target[key], source[key]);
                }
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        });
    }

    return target;
};

export default (...fragments) => {
    const target = {};
    for (const fragment of fragments) {
        merge(target, fragment);
    }

    return target;
};
