import applyProps from './applyProps.js';
import { assembleMetadata, removeLinkStorages, storeOneResults } from './prepareForDelivery';
import prepareForDelivery from './prepareForDelivery';
import {getNodeNamespace} from './createGraph';
import {isFieldInProjection} from '../lib/fieldInProjection';

/**
 * This is always run client side to build the data graph out of client-side collections.
 *
 * @param node
 * @param parentObject
 * @param fetchOptions
 * @returns {*}
 */
function fetch(node, parentObject, fetchOptions = {}) {
    let {filters, options} = applyProps(node);
    // add subscription filter
    if (fetchOptions.scoped && fetchOptions.subscriptionHandle) {
        _.extend(filters, fetchOptions.subscriptionHandle.scopeQuery());
    }
    // add query path filter
    if (fetchOptions.scoped) {
        _.extend(filters, {[`_query_path_${getNodeNamespace(node)}`]: {$exists: true}});
    }

    let results = [];

    if (parentObject) {
        let accessor = node.linker.createLink(parentObject, node.collection);

        if (node.isVirtual) {
            options.fields = options.fields || {};
            if (!isFieldInProjection(options.fields, node.linkStorageField, true)) {
                _.extend(options.fields, {
                    [node.linkStorageField]: 1
                });
            }
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

            collectionNode.results.push(...collectionNodeResults);

            // this was not working because all references must be replaced in snapBackCaches, not only the ones that are 
            // found first
            // const currentIds = _.pluck(collectionNode.results, '_id');
            // collectionNode.results.push(...collectionNodeResults.filter(res => !_.contains(currentIds, res._id)));
        })
    });

    return results;
}

export default (node, params, fetchOptions) => {
    node.results = fetch(node, null, fetchOptions);

    prepareForDelivery(node, params);

    return node.results;
}
