import createSearchFilters from '../../links/lib/createSearchFilters';
import cleanObjectForMetaFilters from './lib/cleanObjectForMetaFilters';
import sift from 'sift';

export default (childCollectionNode, { limit, skip, metaFilters }) => {
    if (childCollectionNode.results.length === 0) {
        return;
    }

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
            cleanObjectForMetaFilters(
                parentResult,
                fieldStorage,
                metaFiltersTest
            );
        });
    }

    const resultsByKeyId = _.groupBy(childCollectionNode.results, '_id');

    if (strategy === 'one') {
        parent.results.forEach(parentResult => {
            if (!parentResult[fieldStorage]) {
                return;
            }

            parentResult[childCollectionNode.linkName] = filterAssembledData(
                resultsByKeyId[parentResult[fieldStorage]],
                { limit, skip }
            );
        });
    }

    if (strategy === 'many') {
        parent.results.forEach(parentResult => {
            if (!parentResult[fieldStorage]) {
                return;
            }

            let data = [];
            parentResult[fieldStorage].forEach(_id => {
                data.push(_.first(resultsByKeyId[_id]));
            });

            parentResult[childCollectionNode.linkName] = filterAssembledData(
                data,
                { limit, skip }
            );
        });
    }

    if (strategy === 'one-meta') {
        parent.results.forEach(parentResult => {
            if (!parentResult[fieldStorage]) {
                return;
            }

            const _id = parentResult[fieldStorage]._id;
            parentResult[childCollectionNode.linkName] = filterAssembledData(
                resultsByKeyId[_id],
                { limit, skip }
            );
        });
    }

    if (strategy === 'many-meta') {
        parent.results.forEach(parentResult => {
            const _ids = _.pluck(parentResult[fieldStorage], '_id');
            let data = [];
            _ids.forEach(_id => {
                data.push(_.first(resultsByKeyId[_id]));
            });

            parentResult[childCollectionNode.linkName] = filterAssembledData(
                data,
                { limit, skip }
            );
        });
    }
};

function filterAssembledData(data, { limit, skip }) {
    if (limit && Array.isArray(data)) {
        return data.slice(skip, limit);
    }

    return data;
}
