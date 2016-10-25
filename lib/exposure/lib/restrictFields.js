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
    if (!_.isArray(restrictedFields)) {
        throw new Meteor.Error('invalid-parameters', 'Please specify an array of restricted fields.');
    }

    if (options.fields) {
        options.fields = _.omit(options.fields, ...restrictedFields);
    } else {
        let restrictingRules = {};
        _.each(restrictedFields, field => {
            restrictingRules[field] = 0
        });

        if (restrictingRules.length) {
            options.fields = _.extend({}, options.fields, restrictingRules)
        }
    }

    if (options.fields && _.keys(options.fields).length === 0) {
        _.extend(options.fields, {_id: 1});
    }

    if (options.sort) {
        options.sort = _.omit(options.sort, ...restrictedFields);
    }

    if (filters) {
        _.each(restrictedFields, field => {
            delete filters[field];
        })
    }

    deepFilterFieldsArray.forEach(field => {
        if (filters[field]) {
            filters[field].forEach(element => restrictFields(element, {}, restrictedFields));
        }
    });

    deepFilterFieldsObject.forEach(field => {
        if (filters[field]) {
            restrictFields(filters[field], {}, restrictedFields);
        }
    });
}
