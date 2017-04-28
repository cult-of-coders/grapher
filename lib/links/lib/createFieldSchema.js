import SimpleSchema from 'simpl-schema';

/**
 * Actually attaches the field schema
 *
 * @returns {boolean}
 * @private
 */
export default (field, isMany, metadata) => {
    let fieldSchema = null;

    if (metadata) {
        if (_.keys(metadata).length) {
            const schema = constructMetadataSchema(metadata);
            fieldSchema = {type: schema};
        } else {
            fieldSchema = {type: Object, blackbox: true}
        }
    } else {
        fieldSchema = {type: String};
    }

    fieldSchema.optional = true;

    if (isMany) {
        return {
            [field]: {type: Array},
            [field + '.$']: fieldSchema
        }
    } else {
        return {
            [field]: fieldSchema
        }
    }
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