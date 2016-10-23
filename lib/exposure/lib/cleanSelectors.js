export function cleanOptions(options, ensureFields) {
    if (!options) {
        return;
    }

    if (options.fields) {
        options.fields = _.pick(options.fields, ...ensureFields);
    }

    if (options.sort) {
        options.sort = _.pick(options.sort, ...ensureFields);
    }
}

const deepFilterFieldsArray = ['$and', '$or', '$nor'];
const deepFilterFieldsObject = ['$not'];
const special = [...deepFilterFieldsArray, ...deepFilterFieldsObject];

export function cleanFilters(filters, ensureFields) {
    if (!filters) {
        return;
    }

    _.each(filters, (value, key) => {
        if (!_.contains(ensureFields, key) && !_.contains(special, key)) {
            delete filters[key];
        }
    });

    deepFilterFieldsArray.forEach(field => {
        if (filters[field]) {
            filters[field].forEach(element => cleanFilters(element, ensureFields));
        }
    });

    deepFilterFieldsObject.forEach(field => {
        if (filters[field]) {
            cleanFilters(filters[field], ensureFields);
        }
    });
}
