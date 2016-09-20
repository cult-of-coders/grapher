import applyProps from './applyProps.js';
import LinkResolve from '../../links/linkTypes/linkResolve.js';

export default function fetch(node, parentObject, userId) {
    let {filters, options} = applyProps(node);

    let results = [];

    if (parentObject) {
        // composition
        let accessor = node.linker.createLink(parentObject);

        // because resolvers are run server side, we may need all the variables of the object in order
        // to provide a proper fetch.
        if (accessor instanceof LinkResolve) {
            accessor.object = node.parent.collection.findOne(parentObject._id);
        }


        results = accessor.fetch(filters, options, userId);
    } else {
        if (node.collection.findSecure) {
            results = node.collection.findSecure(filters, options, userId).fetch();
        } else {
            results = node.collection.find(filters, options).fetch();
        }
    }

    _.each(results, result => {
        _.each(node.collectionNodes, collectionNode => {
            result[collectionNode.linkName] = fetch(collectionNode, result, userId);
            //delete result[node.linker.linkStorageField];
        })
    });

    return results;
}