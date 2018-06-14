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

        if (node.isVirtual) {
            options.fields = options.fields || {};
            _.extend(options.fields, {
                [node.linkStorageField]: 1
            });
        }

        results = accessor.find(filters, options).fetch();
    } else {
        results = node.collection.find(filters, options).fetch();
    }

    _.each(node.collectionNodes, collectionNode => {
        _.each(results, result => {
            const collectionNodeResults = fetch(collectionNode, result);
            result[collectionNode.linkName] = collectionNodeResults;
            //delete result[node.linker.linkStorageField];

            /**
             * Push into the results, because snapBackCaches() in prepareForDelivery does not work otherwise.
             * This is non-optimal, can we be sure that every item in results contains _id and add only if not in
             * the results?
             *
             * Other possible ways:
             * - do something like assemble() in storeHypernovaResults
             * - pass node.results to accessor above and find with sift
             */

            const currentIds = _.pluck(collectionNode.results, '_id');
            collectionNode.results.push(...collectionNodeResults.filter(res => !_.contains(currentIds, res._id)));
        })
    });

    return results;
}

export default (node, params) => {
    node.results = fetch(node);

    prepareForDelivery(node, params);

    return node.results;
}
