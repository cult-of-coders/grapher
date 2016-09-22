import createSearchFilters from '../../links/lib/createSearchFilters';
import sift from 'sift';

export default (childCollectionNode, limit) => {
    const parent = childCollectionNode.parent;
    const linker = childCollectionNode.linker;

    const strategy = linker.strategy;
    const isVirtual = linker.isVirtual();
    const isSingle = linker.isSingle();
    const oneResult = (isVirtual && linker.linkConfig.relatedLinker.linkConfig.unique)
            || (!isVirtual) && isSingle;

    const fieldStorage = linker.linkStorageField;

    _.each(parent.results, result => {
        result[childCollectionNode.linkName] = assembleData(childCollectionNode, result, {
            fieldStorage, strategy, isVirtual, isSingle, oneResult, limit
        });
    });
}

function assembleData(childCollectionNode, result, {fieldStorage, strategy, isVirtual, oneResult, limit}) {
    const filters = createSearchFilters(result, fieldStorage, strategy, isVirtual);
    const data = sift(filters, childCollectionNode.results);

    if (limit) {
        return data.slice(limit);
    }

    if (oneResult) {
        return _.first(data);
    }

    return data;
}