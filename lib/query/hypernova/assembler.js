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

/**
 * Possible options:
 * 
 * A. array of ids directly inside the parentResult
 * {
 *  projectIds: [...],
 * }
 * 
 * B. array of ids in nested document
 * {
 *   nested: {
 *     projectIds: [...],
 *   }
 * }
 * 
 * C. array of ids in nested array
 * {
 *    nestedArray: [{
 *      projectIds: [...],
 *    }, {
 *      projectIds: [...],
 *    }]
 * }
 */
function getIdsForMany(parentResult, fieldStorage) {
    // support dotted fields
    const [root, ...nested] = fieldStorage.split('.');
    const value = dot.pick(root, parentResult);
    if (!value) {
        return [];
    }

    // Option A.
    if (nested.length === 0) {
        return _.isArray(value) ? value : [value];
    }

    // Option C.
    if (_.isArray(value)) {
        return _.flatten(value.map(v => dot.pick(nested.join('.'), v) || []));
    }
    
    // Option B
    if (_.isObject(value)) {
        return dot.pick(nested.join('.'), value) || [];
    }

    // Option B.
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
                rootValue.forEach(result => {
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
            const [root, ...rest] = fieldStorage.split('.');
            const rootValue = parentResult[root];
            if (!rootValue) {
                return;
            }

            const [, ...nestedLinkPath] = childCollectionNode.linkName.split('.');
            if (nestedLinkPath.length > 0 && _.isArray(rootValue)) {
                rootValue.forEach(result => {
                    const value = (dot.pick(rest.join('.'), result) || []).map(id => _.first(resultsByKeyId[id]));
                    const data = filterAssembledData(
                        value,
                        { limit, skip }
                    );
                    result[nestedLinkPath.join('.')] = data;
                });
                return;
            }

            const results = getIdsForMany(parentResult, fieldStorage).map(id => _.first(resultsByKeyId[id]));

            // console.log(parentResult);
            // console.log('results', results);

            const data = filterAssembledData(
                results,
                { limit, skip }
            );

            dot.str(childCollectionNode.linkName, data, parentResult);
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
