import applyProps from './applyProps.js';
import createSearchFilters from '../../links/lib/createSearchFilters.js';

/**
 * This is always run client side to build the data graph out of client-side collections.
 *
 * @param node
 * @param parentObject
 * @param userId
 * @returns {*}
 */
export default function fetch(node, parentObject, userId) {
    let {filters, options} = applyProps(node);

    let results = [];

    if (parentObject) {
        let accessor = node.linker.createLink(parentObject, node.collection);
        if (node.linker.isResolver()) {
            accessor.object = node.parent.collection.findOne(parentObject._id);

            results = accessor.fetch(filters, options, userId);
        } else {
            results = accessor.find(filters, options, userId).fetch();
        }
    } else {
        results = node.collection.find(filters, options, userId).fetch();
    }

    _.each(node.collectionNodes, collectionNode => {
        _.each(results, result => {
            result[collectionNode.linkName] = fetch(collectionNode, result, userId);
            //delete result[node.linker.linkStorageField];
        })
    });

    if (parentObject) {
        if (node.isOneResult) {
            return _.first(results);
        }
    }

    return results;
}
