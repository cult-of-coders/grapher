import applyProps from './applyProps.js';
import { assembleMetadata, removeLinkStorages, storeOneResults } from './prepareForDelivery';
import prepareForDelivery from './prepareForDelivery';

/**
 * This is always run client side to build the data graph out of client-side collections.
 *
 * @param node
 * @param parentObject
 * @returns {*}
 */
function fetch(node, parentObject) {
    let {filters, options} = applyProps(node);

    let results = [];

    if (parentObject) {
        let accessor = node.linker.createLink(parentObject, node.collection);

        if (node.linker.isResolver()) {
            accessor.object = node.parent.collection.findOne(parentObject._id);

            results = accessor.fetch(filters, options);
        } else {
            if (node.isVirtual) {
                options.fields = options.fields || {};
                _.extend(options.fields, {
                    [node.linkStorageField]: 1
                });
            }

            results = accessor.find(filters, options).fetch();
        }
    } else {
        results = node.collection.find(filters, options).fetch();
    }

    _.each(node.collectionNodes, collectionNode => {
        _.each(results, result => {
            result[collectionNode.linkName] = fetch(collectionNode, result);
            //delete result[node.linker.linkStorageField];
        })
    });

    return results;
}

export default (node) => {
    node.results = fetch(node);

    prepareForDelivery(node);

    return node.results;
}
