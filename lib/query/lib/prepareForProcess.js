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

function applyPagination(body, _params) {
    if (body['$paginate'] && _params) {
        if (!body.$options) {
            body.$options = {};
        }

        if (_params.limit) {
            _.extend(body.$options, {
                limit: _params.limit
            })
        }

        if (_params.skip) {
            _.extend(body.$options, {
                skip: _params.skip
            })
        }

        delete body['$paginate'];
    }
}

export default (_body, _params = {}) => {
    let body = deepClone(_body);
    let params = deepClone(_params);

    applyPagination(body, params);
    applyFilterRecursive(body, params);

    return body;
}
