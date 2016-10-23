import createSearchFilters from '../../links/lib/createSearchFilters';
import cleanObjectForMetaFilters from './lib/cleanObjectForMetaFilters';
import sift from 'sift';

export default (childCollectionNode, {limit, skip, metaFilters}) => {
    const parent = childCollectionNode.parent;
    const linker = childCollectionNode.linker;

    const strategy = linker.strategy;
    const isSingle = linker.isSingle();
    const isMeta = linker.isMeta();
    const fieldStorage = linker.linkStorageField;

    // cleaning the parent results from a child
    // this may be the wrong approach but it works for now
    if (isMeta && metaFilters) {
        const metaFiltersTest = sift(metaFilters);
        _.each(parent.results, parentResult => {
            cleanObjectForMetaFilters(parentResult, fieldStorage, metaFiltersTest);
        })
    }

    _.each(parent.results, result => {
        let data = assembleData(childCollectionNode, result, {
            fieldStorage, strategy, isSingle
        });

        result[childCollectionNode.linkName] = filterAssembledData(data, {limit, skip})
    });
}

function filterAssembledData(data, {limit, skip}) {
    if (limit) {
        return data.slice(skip, limit);
    }

    return data;
}

function assembleData(childCollectionNode, result, {fieldStorage, strategy}) {
    const filters = createSearchFilters(result, fieldStorage, strategy, false);

    return sift(filters, childCollectionNode.results);
}
