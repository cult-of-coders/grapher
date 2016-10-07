import createSearchFilters from '../../links/lib/createSearchFilters';
import sift from 'sift';

export default (childCollectionNode, {limit, skip}) => {
    const parent = childCollectionNode.parent;
    const linker = childCollectionNode.linker;

    const strategy = linker.strategy;
    const isVirtual = linker.isVirtual();
    const isSingle = linker.isSingle();
    const isMeta = linker.isMeta();
    const removeStorageField = !childCollectionNode.parentHasMyLinkStorageFieldSpecified();
    const oneResult = linker.isOneResult();

    const fieldStorage = linker.linkStorageField;

    _.each(parent.results, result => {
        let data = assembleData(childCollectionNode, result, {
            fieldStorage, strategy, isVirtual, isSingle
        });

        if (isMeta && !isVirtual) {
            assembleMetadata(data, result[fieldStorage]);
        }

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

function assembleMetadata(elements, storage) {
    if (_.isArray(storage)) {
        _.each(elements, element => {
            element.$metadata = _.find(storage, (storageMetadata) => {
                return element._id == storageMetadata._id
            });

            if (element.$metadata) {
                element.$metadata = _.omit(element.$metadata, '_id');
            }
        })
    } else {
        _.each(elements, element => {
            element.$metadata = _.omit(storage, '_id');
        })
    }
}
