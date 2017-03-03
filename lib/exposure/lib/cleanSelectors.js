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
        if (!_.contains(special, key)) {
            if (!fieldExists(ensureFields, key)) {
                delete filters[key];
            }
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

/**
 * This will check if a field exists in a set of fields
 * If fields contains ["profile"], then "profile.something" will return true
 *
 * @param fields
 * @param key
 * @returns {boolean}
 */
export function fieldExists(fields, key) {
    for (let i = 0; i < fields.length; i++) {
        if (fields[i] === key || key.indexOf(fields[i] + '.') === 0) {
            return true;
        }
    }

    return false;
}
