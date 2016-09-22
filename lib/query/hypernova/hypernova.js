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

                childCollectionNode.results = accessor.find(filters, options);
            });
        } else {
            storeHypernovaResults(childCollectionNode, userId);

            let start = new Date();
            hypernova(childCollectionNode, userId);
            let end = new Date();
            console.log(`hypernova: ${end.getTime() - start.getTime()}`);
        }
    });
}

export default function hypernovaInit(collectionNode, userId) {
    let {filters, options} = applyProps(collectionNode);

    const collection = collectionNode.collection;
    if (collection.findSecure) {
        collectionNode.results = collection.findSecure(filters, options, userId).fetch();
    } else {
        collectionNode.results = collection.find(filters, options).fetch();
    }

    hypernova(collectionNode, userId);

    return collectionNode.results;
}

