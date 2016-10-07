/**
 * Deep merge two objects.
 * @param target
 * @param source
 */
export default function mergeDeep(target, source) {
    if (_.isObject(target) && _.isObject(source)) {
        _.each(source, (value, key) => {
            if (_.isFunction(source[key])) {
                target[key] = source[key];
            } else if (_.isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        });
    }

    return target;
}