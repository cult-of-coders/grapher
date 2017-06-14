/**
 * Actually attaches the field schema
 *
 * @returns {boolean}
 * @private
 */
export default (collection, {metadata, field}, isMany) => {
    if (metadata) {
        if (_.keys(metadata).length) {
            const schema = constructMetadataSchema(field, isMany, metadata);

            if (isMany) {
                collection.attachSchema({
                    [field]: {type: Array, optional: true},
                    [field + '.$']: {type: Object},
                    ...schema
                })

            } else {
                collection.attachSchema({
                    [field]: {type: schema},
                    ...schema
                })
            }
        } else {
            if (isMany) {
                collection.attachSchema({
                    [field]: {type: Array, optional: true},
                    [field + '.$']: {type: Object, blackbox: true}
                });
            } else {
                collection.attachSchema({
                    [field]: {type: Object, blackbox: true, optional: true}
                });
            }
        }
    } else {
        if (isMany) {
            collection.attachSchema({
                [field]: {type: Array, optional: true},
                [field + '.$']: {type: String},
            })
        } else {
            collection.attachSchema({
                [field]: {
                    type: String,
                    optional: true
                }
            })
        }
    }
}

function constructMetadataSchema(field, isMany, metadataSchema) {
    let suffix = isMany ? '.$' : '';
    let schemaDefinition = {
        [field + suffix + `._id`]: {type: String}
    };

    _.each(metadataSchema, (value, key) => {
        schemaDefinition[field + suffix + '.' + key] = value;
    });

    console.log(schemaDefinition);

    return schemaDefinition;
}