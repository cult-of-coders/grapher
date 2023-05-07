import {check, Match} from 'meteor/check';
import deepClone from 'lodash.clonedeep';

function defaultFilterFunction({
    filters,
    options,
    params
}) {
    if (params.filters) {
        Object.assign(filters, params.filters);
    }
    if (params.options) {
        Object.assign(options, params.options);
    }
}

function applyFilterRecursive(data, params = {}, isRoot = false) {
    if (isRoot && !_.isFunction(data.$filter)) {
        data.$filter = defaultFilterFunction;
    }

    if (data.$filter) {
        check(data.$filter, Match.OneOf(Function, [Function]));

        data.$filters = data.$filters || {};
        data.$options = data.$options || {};

        if (Array.isArray(data.$filter)) {
            data.$filter.forEach(filter => {
                filter.call(null, {
                    filters: data.$filters,
                    options: data.$options,
                    params: params
                })
            });
        } else {
            data.$filter({
                filters: data.$filters,
                options: data.$options,
                params: params
            });
        }

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
    applyFilterRecursive(body, params, true);

    return body;
}
