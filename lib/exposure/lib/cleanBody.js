import deepClone from 'lodash.clonedeep';
import {cleanFilters, cleanOptions} from './cleanSelectors';
import dotize from '../../query/lib/dotize';

/**
 * Deep Inter Computation
 */
export default function cleanBody(main, second, ...args) {
    let object = {};

    if (second.$filters || second.$options) {
        const fields = getFields(main);

        cleanFilters(second.$filters, fields);
        cleanOptions(second.$options, fields);
    }

    _.each(second, (secondValue, key) => {
        if (key === '$filters' || key === '$options') {
            object[key] = secondValue;
            return;
        }

        let value = main[key];

        if (value === undefined) {
            return;
        }

        // if the main value is a function, we run it.
        if (_.isFunction(value)) {
            value = value.call(null, ...args);
        }

        // if the main value is undefined or false, we skip the merge
        if (value === undefined || value === false) {
            return;
        }

        // we treat this specially, if the value is true
        if (value === true) {
            object[key] = _.isObject(secondValue) ? deepClone(secondValue) : value;
            return;
        }

        // if the main value is an object
        if (_.isObject(value)) {
            if (_.isObject(secondValue)) {
                // if the second one is an object as well we run recursively run the intersection
                object[key] = cleanBody(value, secondValue, ...args);
            }
            // if it is not, then we will ignore it, because it won't make sense.
            // to merge {a: 1} with 1.

            return;
        }

        // if the main value is not an object, it should be a truthy value like 1
        if (_.isObject(secondValue)) {
            // if the second value is an object, then we will keep it.
            // this won't cause problem with deep nesting because
            // when you specify links you will have the main value as an object, otherwise it will fail
            // this is used for things like when you have a hash object like profile with multiple nesting fields, you can allow the client to specify only what he needs

            object[key] = deepClone(secondValue);
        } else {
            // if the second value is not an object, we just store the first value
            object[key] = value;
        }
    });

    return object;
}

function getFields(body) {
    return _.keys(dotize.convert(body));
}