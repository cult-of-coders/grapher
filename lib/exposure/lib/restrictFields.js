/**
 * This is used to restrict some fields to some users, by passing the fields as array in the exposure object
 * For example in an user exposure: restrictFields(options, ['services', 'createdAt'])
 *
 * @param options
 * @param restrictedFields
 */
export default (options, restrictedFields) => {
    if (options.fields) {
        options.fields = _.omit(options.fields, ...restrictedFields);
    } else {
        let restrictingRules = {};
        _.each(restrictedFields, field => {
            restrictingRules[field] = 0
        });

        options.fields = _.extend({}, options.fields, restrictingRules)
    }
}
