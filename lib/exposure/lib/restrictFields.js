/**
 * This is used to restrict some fields to some users, by passing the fields as array in the exposure object
 * For example in an user exposure: restrictFields(options, ['services', 'createdAt'])
 *
 * @param filters
 * @param options
 * @param restrictedFields
 */
export default (filters, options, restrictedFields) => {
    if (options.fields) {
        options.fields = _.omit(options.fields, ...restrictedFields);
    } else {
        let restrictingRules = {};
        _.each(restrictedFields, field => {
            restrictingRules[field] = 0
        });

        options.fields = _.extend({}, options.fields, restrictingRules)
    }

    if (options.sort) {
        options.sort = _.omit(options.sort, ...restrictedFields);
    }

    if (filters) {
        _.each(restrictedFields, field => {
            delete filters[field];
        })
    }
}
