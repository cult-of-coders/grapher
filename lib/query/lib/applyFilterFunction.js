import deepClone from './deepClone.js';

function applyFilterRecursive(data, params = {}) {
    if (_.isFunction(data.$filter)) {
        data.$filters = data.$filters || {};
        data.$options = data.$options || {};

        data.$filter({
            filters: data.$filters,
            options: data.$options,
            params: params
        });

        data.$filter = null;
        delete(data.$filter);
    }

    _.each(data, (value, key) => {
        if (_.isObject(value)) {
            return applyFilterRecursive(value, params);
        }
    })
}

export default (_body, _params = {}) => {
    let body = deepClone(_body);
    let params = deepClone(_params);

    applyFilterRecursive(body, params);

    return body;
}