function applyFilterRecursive(data, params) {
    if (data.$filter) {
        data.$filters = data.$filters || {};
        data.$options = data.$options || {};

        data.$filter({
            filters: data.$filters,
            options: data.$options,
            params: params
        });

        delete(data.$filter);
    }

    _.each(data, (value, key) => {
        if (_.isObject(value)) {
            return applyFilterRecursive(value);
        }
    })
}

export default (_body, params = {}) => {
    let body = _.clone(_body, true);
    applyFilterRecursive(body, params);

    return body;
}