import applyProps from '../lib/applyProps.js';
import LinkResolve from '../../links/linkTypes/linkResolve.js';
import storeHypernovaResults from './storeHypernovaResults.js';
import assembler from './assembler.js';

function hypernova(collectionNode, userId, debug) {
    _.each(collectionNode.collectionNodes, childCollectionNode => {
        let {filters, options} = applyProps(childCollectionNode);

        if (childCollectionNode.linker.isResolver()) {
            _.each(collectionNode.results, result => {
                const accessor = childCollectionNode.linker.createLink(result);
                result[childCollectionNode.linkName] = accessor.find(filters, options);
            });
        } else {
            storeHypernovaResults(childCollectionNode, userId, debug);

            hypernova(childCollectionNode, userId, debug);
        }
    });
}

export default function hypernovaInit(collectionNode, userId, debug) {
    let {filters, options} = applyProps(collectionNode);

    const collection = collectionNode.collection;

    collectionNode.results = collection.find(filters, options, userId).fetch();

    hypernova(collectionNode, userId, debug);


    return collectionNode.results;
}

