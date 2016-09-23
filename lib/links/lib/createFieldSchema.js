/**
 * Actually attaches the field schema
 *
 * @returns {boolean}
 * @private
 */
export default (isMany, metadata) => {
    let fieldSchema = null;

    if (metadata) {
        if (_.keys(metadata).length) {
            const schema = constructMetadataSchema(metadata);
            fieldSchema = (isMany) ? {type: [schema]} : {type: schema};
        } else {
            if (isMany) {
                fieldSchema = {type: [Object], blackbox: true};
            } else {
                fieldSchema = {type: Object, blackbox: true}
            }
        }
    } else {
        fieldSchema = (isMany) ? {type: [String]} : {type: String};
    }

    fieldSchema.optional = true;

    return fieldSchema;
}

function constructMetadataSchema(metadataSchema) {
    let schemaDefinition = {
        _id: {type: String}
    };

    _.each(metadataSchema, (value, key) => {
        schemaDefinition[key] = value;
    });

    return new SimpleSchema(schemaDefinition);
}