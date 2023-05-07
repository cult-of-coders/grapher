import { _ } from 'meteor/underscore';
import {SAFE_DOTTED_FIELD_REPLACEMENT} from './constants';

export default function (childCollectionNode, filters, options, userId) {
    let containsDottedFields = false;
    const linker = childCollectionNode.linker;
    const linkStorageField = linker.linkStorageField;
    const collection = childCollectionNode.collection;

    let pipeline = [];

    if (collection.firewall) {
        collection.firewall(filters, options, userId);
    }

    filters = cleanUndefinedLeafs(filters);

    pipeline.push({$match: filters});

    if (options.sort && _.keys(options.sort).length > 0) {
        pipeline.push({$sort: options.sort})
    }

    let _id = linkStorageField;
    if (linker.isMeta()) {
        _id += '._id';
    }

    let dataPush = {
        _id: '$_id'
    };

    _.each(options.fields, (value, field) => {
        if (field.indexOf('.') >= 0) {
            containsDottedFields = true;
        }
        const safeField = field.replace(/\./g, SAFE_DOTTED_FIELD_REPLACEMENT);
        dataPush[safeField] = '$' + field
    });

    if (linker.isMeta()) {
        dataPush[linkStorageField] = '$' + linkStorageField;
    }

    pipeline.push({
        $group: {
            _id: "$" + _id,
            data: {
                $push: dataPush
            }
        }
    });

    if (options.limit || options.skip) {
        let $slice = ["$data"];
        if (options.skip) $slice.push(options.skip);
        if (options.limit) $slice.push(options.limit);

        pipeline.push({
            $project: {
                _id: 1,
                data: {$slice}
            }
        })
    }

    function cleanUndefinedLeafs(tree) {
        const a = Object.assign({}, tree);
        _.each(a, (value, key) => {
            if (value === undefined) {
                delete a[key];
            }

            if (!Array.isArray(value) && _.isObject(value) && !(value instanceof Date)) {
                a[key] = cleanUndefinedLeafs(value);
            }
        })

        return a;
    }

    return {pipeline, containsDottedFields};
}
