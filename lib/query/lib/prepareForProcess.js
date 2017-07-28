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

function handleTextFilters(data, isClient) {
    _.each(data, field => {
        if (field.$text) {
            if (isClient) {
                let $or = _.map(field.$text.$fields, (val, key) => {
                    return {
                        [key]: {
                            $regex:field.$text.$search,
                            $options: field.$text.$caseSensitive ? '' : 'i'
                        }
                    }
                })
                delete field.$text
                if (_.isEmpty(field)) {
                    field = {$or}
                } else {
                    field = {$and:[field, {$or}]}
                }
            } else {
                delete field.$text.$fields
            }
        } else if (_.isObject(field)) {
            handleTextFilters(field, isClient)
        }
    })
}

export default (_body, _params = {}, isClient) => {
    let body = deepClone(_body);
    let params = deepClone(_params);

    applyPagination(body, params);
    applyFilterRecursive(body, params);
    handleTextFilters(body, isClient)
    
    return body;
}
