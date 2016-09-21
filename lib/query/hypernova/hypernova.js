import applyProps from '../lib/applyProps.js';
import LinkResolve from '../../links/linkTypes/linkResolve.js';
import storeHypernovaResults from './storeHypernovaResults.js';

function hypernova(collectionNode, userId) {
    _.each(collectionNode.collectionNodes, childCollectionNode => {
        let {filters, options} = applyProps(childCollectionNode);

        if (childCollectionNode.linker.isResolver()) {
            _.each(collectionNode.results, result => {
                const accessor = childCollectionNode.linker.createLink(result);

                childCollectionNode.results = accessor.find(filters, options);
            });
        } else {
            storeHypernovaResults(childCollectionNode, userId);

            hypernova(childCollectionNode, userId);
        }
    });
}

export default function hypernovaInit(collectionNode, userId) {
    let results = [];
    let {filters, options} = applyProps(collectionNode);

    const collection = collectionNode.collection;
    if (collection.findSecure) {
        results = collection.findSecure(filters, options, userId).fetch();
    } else {
        results = collection.find(filters, options).fetch();
    }

    collectionNode.results = results;

    return hypernova(collectionNode, userId);
}

