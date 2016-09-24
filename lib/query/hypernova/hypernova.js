import applyProps from '../lib/applyProps.js';
import LinkResolve from '../../links/linkTypes/linkResolve.js';
import storeHypernovaResults from './storeHypernovaResults.js';
import assembler from './assembler.js';

function hypernova(collectionNode, userId) {
    _.each(collectionNode.collectionNodes, childCollectionNode => {
        let {filters, options} = applyProps(childCollectionNode);

        if (childCollectionNode.linker.isResolver()) {
            _.each(collectionNode.results, result => {
                const accessor = childCollectionNode.linker.createLink(result);

                result[childCollectionNode.linkName] = accessor.find(filters, options);
            });
        } else {
            storeHypernovaResults(childCollectionNode, userId);

            hypernova(childCollectionNode, userId);
        }
    });
}

export default function hypernovaInit(collectionNode, userId) {
    let {filters, options} = applyProps(collectionNode);

    const collection = collectionNode.collection;
    collectionNode.results = collection.find(filters, options, userId).fetch();

    hypernova(collectionNode, userId);

    return collectionNode.results;
}

