const deepFilterFieldsArray = ['$and', '$or', '$nor'];
const deepFilterFieldsObject = ['$not'];

/**
 * This is used to restrict some fields to some users, by passing the fields as array in the exposure object
 * For example in an user exposure: restrictFields(options, ['services', 'createdAt'])
 *
 * @param filters Object
 * @param options Object
 * @param restrictedFields Array
 */
export default function restrictFields(filters, options, restrictedFields) {
    if (!Array.isArray(restrictedFields)) {
        throw new Meteor.Error('invalid-parameters', 'Please specify an array of restricted fields.');
    }

    cleanFilters(filters, restrictedFields);
    cleanOptions(options, restrictedFields)
}

/**
 * Deep cleans filters
 *
 * @param filters
 * @param restrictedFields
 */
function cleanFilters(filters, restrictedFields) {
    if (filters) {
        cleanObject(filters, restrictedFields);
    }

    deepFilterFieldsArray.forEach(field => {
        if (filters[field]) {
            filters[field].forEach(element => cleanFilters(element, restrictedFields));
        }
    });

    deepFilterFieldsObject.forEach(field => {
        if (filters[field]) {
            cleanFilters(filters[field], restrictedFields);
        }
    });
}

/**
 * Deeply cleans options
 *
 * @param options
 * @param restrictedFields
 */
function cleanOptions(options, restrictedFields) {
    if (options.fields) {
        cleanObject(options.fields, restrictedFields);

        if (_.keys(options.fields).length === 0) {
            _.extend(options.fields, {_id: 1})
        }
    } else {
        options.fields = {_id: 1};
    }

    if (options.sort) {
        cleanObject(options.sort, restrictedFields);
    }
}

/**
 * Cleans the object (not deeply)
 *
 * @param object
 * @param restrictedFields
 */
function cleanObject(object, restrictedFields) {
    _.each(object, (value, key) => {
        restrictedFields.forEach((restrictedField) => {
            if (matching(restrictedField, key)) {
                delete object[key];
            }
        })
    });
}

/**
 * Returns true if field == subfield or if `${field}.` INCLUDED in subfield
 * Example: "profile" and "profile.firstName" will be a matching field
 * @param field
 * @param subfield
 * @returns {boolean}
 */
function matching(field, subfield) {
    if (field === subfield) {
        return true;
    }

    return subfield.slice(0, field.length + 1) === field + '.';
}
