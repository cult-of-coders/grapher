import createSearchFilters from '../../links/lib/createSearchFilters';
import sift from 'sift';

export default (childCollectionNode, {limit, skip}) => {
    const parent = childCollectionNode.parent;
    const linker = childCollectionNode.linker;

    const strategy = linker.strategy;
    const isVirtual = linker.isVirtual();
    const isSingle = linker.isSingle();
    const removeStorageField = !childCollectionNode.parentHasMyLinkStorageFieldSpecified();
    const oneResult = linker.isOneResult();

    const fieldStorage = linker.linkStorageField;

    _.each(parent.results, result => {
        const data = assembleData(childCollectionNode, result, {
            fieldStorage, strategy, isVirtual, isSingle
        });

        result[childCollectionNode.linkName] = filterAssembledData(data, {limit, skip, oneResult})
    });

    if (removeStorageField) {
        _.each(parent.results, result => delete result[fieldStorage]);
    }
}

function filterAssembledData(data, {limit, skip, oneResult}) {
    if (limit) {
        return data.slice(skip, limit);
    }

    if (oneResult) {
        return _.first(data);
    }

    return data;
}

function assembleData(childCollectionNode, result, {fieldStorage, strategy, isVirtual}) {
    const filters = createSearchFilters(result, fieldStorage, strategy, isVirtual);

    return sift(filters, childCollectionNode.results);
}