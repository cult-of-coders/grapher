import createSearchFilters from './createSearchFilters';
import sift from 'sift';

export default (childCollectionNode) => {
    const parent = childCollectionNode.parent;

    const strategy = childCollectionNode.linker.strategy;
    const isVirtual = childCollectionNode.linker.isVirtual();
    const fieldStorage = (isVirtual)
        ? childCollectionNode.linker.linkConfig.relatedLinker.linkStorageField
        : childCollectionNode.linker.linkStorageField;

    _.each(parent.results, result => {
        result[childCollectionNode.linkName] = assembleData(childCollectionNode, result, {
            fieldStorage, strategy, isVirtual
        })
    })
}

function assembleData(childCollectionNode, result, {fieldStorage, strategy, isVirtual}) {

    const filters = createSearchFilters(result, fieldStorage, strategy, isVirtual);

    return sift(filters, childCollectionNode.results);
}