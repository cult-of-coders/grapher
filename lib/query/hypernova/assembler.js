import createSearchFilters from '../../links/lib/createSearchFilters';
import cleanObjectForMetaFilters from './lib/cleanObjectForMetaFilters';
import sift from 'sift';
import dot from 'dot-object';
import { isString } from 'util';

function getIdsFromArray(array, nested) {
    const ids = [];
    array.forEach(v => {
        const _id = nested.length > 0 ? dot.pick(nested.join('.'), v) : v;
        ids.push(_id);
    });
    return ids;
}

function getIdsForMany(parentResult, fieldStorage) {
    // support dotted fields
    const [root, ...nested] = fieldStorage.split('.');
    const value = dot.pick(root, parentResult);
    if (!value) {
        return [];
    }
    return getIdsFromArray(value, nested);
}

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

    const resultsByKeyId = _.groupBy(childCollectionNode.results, linker.foreignIdentityField);

    if (strategy === 'one') {
        parent.results.forEach(parentResult => {
            const [root, ...rest] = fieldStorage.split('.');
            const rootValue = parentResult[root];
            if (!rootValue) {
                return;
            }

            const path = childCollectionNode.linkName.split('.');

            if (_.isArray(rootValue)) {
                rootValue.map(result => {
                    const value = dot.pick(rest.join('.'), result);
                    const data = filterAssembledData(
                        resultsByKeyId[value],
                        { limit, skip }
                    );
                    result[path.slice(1).join('.')] = data;
                });
                return;
            }
            
            const value = dot.pick(fieldStorage, parentResult);
            if (!value) {
                return;
            }

            const data = filterAssembledData(
                resultsByKeyId[value],
                { limit, skip }
            );
            dot.str(childCollectionNode.linkName, data, parentResult);
        });
    }

    if (strategy === 'many') {
        parent.results.forEach(parentResult => {
            const data = getIdsForMany(parentResult, fieldStorage).map(id => _.first(resultsByKeyId[id]));
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
    if (Array.isArray(data)) {
        data = data.filter(Boolean);
        if (limit) {
            return data.slice(skip, limit);
        }
    }

    return data;
}
