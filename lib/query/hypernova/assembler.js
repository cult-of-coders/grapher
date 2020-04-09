import createSearchFilters from '../../links/lib/createSearchFilters';
import cleanObjectForMetaFilters from './lib/cleanObjectForMetaFilters';
import sift from 'sift';
import dot from 'dot-object';

/**
 * 
 * getIdsForMany
 * 
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
 * Case for link with foreignIdentityField on projectId. This is still 'many' link because mapping could be one to many.
 * {
 *   nested: {
 *     projectId: 1.
 *   },
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
 * 
 * Case with foreign identity field.
 * {
 *    nestedArray: [{
 *      projectId: 1,
 *    }, {
 *      projectId: 2,
 *    }]
 * }
 */
function getIdsForMany(parentResult, fieldStorage) {
    // support dotted fields
    const [root, ...nested] = fieldStorage.split('.');
    const value = dot.pick(root, parentResult);

    if (_.isUndefined(value) || _.isNull(value)) {
        return [];
    }

    // Option A.
    if (nested.length === 0) {
        return _.isArray(value) ? value : [value];
    }

    // Option C.
    if (_.isArray(value)) {
        return _.flatten(value.map(v => getIdsFromObject(v, nested.join('.'))));
    }
    
    // Option B
    if (_.isObject(value)) {
        return getIdsFromObject(value, nested.join('.'));
    }

    return [];
}

function getIdsFromObject(object, path) {
    const pickedValue = dot.pick(path, object);
    return _.isArray(pickedValue) ? pickedValue : ((_.isUndefined(pickedValue) || _.isNull(pickedValue)) ? [] : [pickedValue]);
}

export function assembleMany(parentResult, {
    childCollectionNode,
    linker,
    limit,
    skip,
    resultsByKeyId,
}) {
    const fieldStorage = linker.linkStorageField;

    const [root, ...rest] = fieldStorage.split('.');
    const rootValue = parentResult[root];
    if (!rootValue) {
        return;
    }

    const [, ...nestedLinkPath] = childCollectionNode.linkName.split('.');
    if (nestedLinkPath.length > 0 && _.isArray(rootValue)) {
        rootValue.forEach(result => {
            const results = _.flatten(_.union(...getIdsForMany(result, rest.join('.')).map(id => resultsByKeyId[id])));
            const data = filterAssembledData(
                results,
                { limit, skip }
            );
            result[nestedLinkPath.join('.')] = data;
        });
        return;
    }

    const results = _.union(...getIdsForMany(parentResult, fieldStorage).map(id => resultsByKeyId[id]));
    const data = filterAssembledData(
        results,
        { limit, skip }
    );
    dot.str(childCollectionNode.linkName, data, parentResult);
}

export function assembleManyMeta(parentResult, {
    childCollectionNode,
    linker,
    skip,
    limit,
    resultsByKeyId,
}) {
    const fieldStorage = linker.linkStorageField;

    const _ids = _.pluck(parentResult[fieldStorage], '_id');
    let data = [];
    _ids.forEach(_id => {
        data.push(_.first(resultsByKeyId[_id]));
    });

    parentResult[childCollectionNode.linkName] = filterAssembledData(
        data,
        { limit, skip }
    );
}

export function assembleOneMeta(parentResult, {
    childCollectionNode,
    linker,
    limit,
    skip,
    resultsByKeyId,
}) {
    const fieldStorage = linker.linkStorageField;

    if (!parentResult[fieldStorage]) {
        return;
    }

    const _id = parentResult[fieldStorage]._id;
    parentResult[childCollectionNode.linkName] = filterAssembledData(
        resultsByKeyId[_id],
        { limit, skip }
    );
}

export function assembleOne(parentResult, {
    childCollectionNode,
    linker,
    limit,
    skip,
    resultsByKeyId,
}) {
    const fieldStorage = linker.linkStorageField;

    const [root, ...rest] = fieldStorage.split('.');
    const rootValue = parentResult[root];
    if (!rootValue) {
        return;
    }

    // todo: using linker.linkName should be correct here since it should be the same as childCollectionNode.linkName
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

    if (childCollectionNode.linkName !== linker.linkName) {
        throw new Error(`error: ${childCollectionNode.linkName} ${linker.linkName}`);
    }

    if (strategy === 'one') {
        parent.results.forEach(parentResult => {
            return assembleOne(parentResult, {
                childCollectionNode,
                linker,
                limit,
                skip,
                resultsByKeyId,
            });
        });
    }

    if (strategy === 'many') {
        parent.results.forEach(parentResult => {
            return assembleMany(parentResult, {
                childCollectionNode,
                linker,
                skip,
                limit,
                resultsByKeyId,
            });
        });
    }

    if (strategy === 'one-meta') {
        parent.results.forEach(parentResult => {
            return assembleOneMeta(parentResult, {
                linker,
                childCollectionNode,
                limit,
                skip,
                resultsByKeyId,
            })
        });
    }

    if (strategy === 'many-meta') {
        parent.results.forEach(parentResult => {
            return assembleManyMeta(parentResult, {
                childCollectionNode,
                linker,
                limit,
                skip,
                resultsByKeyId,
            });
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
