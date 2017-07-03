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
function convertRegexpFilters(filters){
    _.each(filters, (selector, key) => {
        // Mongo supports both {field: /foo/} and {field: {$regex: /foo/}}
        if (selector instanceof RegExp) {
           filters[key] = convertRegexpToMongoSelector(selector);
        } else if (selector && selector.$regex instanceof RegExp) {
            filters[key] = convertRegexpToMongoSelector(selector.$regex);
            // if selector is {$regex: /foo/, $options: ...} then $options
            // override the ones set on $regex.
            if (selector.$options !== undefined)
                filters[key].$options = selector.$options;
        } else if (_.contains(['$or','$and','$nor'], key)) {
            // Translate lower levels of $and/$or/$nor
            _.each(selector, val => convertRegexpFilters(val))
        }
    });
}
function convertRegexpToMongoSelector(regexp) {
    var selector = {$regex: regexp.source};
    var regexOptions = '';
    // JS RegExp objects support 'i', 'm', and 'g'. Mongo regex $options
    // support 'i', 'm', 'x', and 's'. So we support 'i' and 'm' here.
    if (regexp.ignoreCase)
        regexOptions += 'i';
    if (regexp.multiline)
        regexOptions += 'm';
    if (regexOptions)
        selector.$options = regexOptions;

    return selector;
}
export default (_body, _params = {}) => {
    let body = deepClone(_body);
    let params = deepClone(_params);

    applyPagination(body, params);
    applyFilterRecursive(body, params);
    convertRegexpFilters(body.$filters);
    convertRegexpFilters(body.$postFilters);
    
    return body;
}
