import applyProps from './applyProps.js';
import LinkResolve from '../../links/linkTypes/linkResolve.js';

export default function fetch(node, parentObject, userId) {
    let filters = {}, options = {};
    applyProps(node, filters, options);

    let results = [];

    if (parentObject) {
        // composition
        let accessor = node.linker.createLink(parentObject);

        // because resolvers are run server side, we may need all the variables of the object in order
        // to provide a propper fetch.
        if (accessor instanceof LinkResolve) {
            accessor.object = node.parent.collection.findOne(parentObject._id);
        }

        results = accessor.fetch(filters, options, userId);
    } else {
        if (node.collection.findSecure) {
            results = node.collection.find(filters, options, userId).fetch();
        } else {
            results = node.collection.find(filters, options).fetch();
        }
    }

    // cleaning the storage field nodes, so we won't have a poluted response.
    _.each(results, result => {
        _.each(node.collectionNodes, node => {
            result[node.linkName] = fetch(node, result, userId);
            delete result[node.linker.linkStorageField];
        })
    });

    if (parentObject && node.linker.isSingle()) {
        return _.first(results);
    }

    return results;
}