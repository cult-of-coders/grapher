import { _ } from 'meteor/underscore';
import { isFieldInProjection } from '../lib/fieldInProjection';

export default function (childCollectionNode, filters, options, userId) {
    const linker = childCollectionNode.linker;
    const linkStorageField = linker.linkStorageField;
    const collection = childCollectionNode.collection;

    if (collection.firewall) {
        collection.firewall(filters, options, userId);
    }

    filters = cleanUndefinedLeafs(filters);

    const dataProjection = {};
    _.each(options.fields, (value, field) => {
        dataProjection[field] = 1;
    });

    if (!isFieldInProjection(dataProjection, linkStorageField, true)) {
        dataProjection[linkStorageField] = 1;
    }

    function cleanUndefinedLeafs(tree) {
        const a = Object.assign({}, tree);
        _.each(a, (value, key) => {
            if (value === undefined) {
                delete a[key];
            }

            if (!_.isArray(value) && _.isObject(value) && !(value instanceof Date)) {
                a[key] = cleanUndefinedLeafs(value);
            }
        });

        return a;
    }

    return {filters, options: {...options, fields: dataProjection}};
}
