import applyProps from '../lib/applyProps.js';
import prepareForDelivery from '../lib/prepareForDelivery.js';
import storeHypernovaResults from './storeHypernovaResults.js';

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

export default function hypernovaInit(collectionNode, userId, config = {bypassFirewalls: false}) {
    let {filters, options} = applyProps(collectionNode);

    const collection = collectionNode.collection;

    collectionNode.results = collection.find(filters, options, userId).fetch();

    const userIdToPass = (config.bypassFirewalls) ? undefined : userId;
    hypernova(collectionNode, userIdToPass);

    prepareForDelivery(collectionNode);

    return collectionNode.results;
}
