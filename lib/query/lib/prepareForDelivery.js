// 1. Clone children with meta relationships
// 2. Apply $metadata to children
// 3. Removes link storage (if not specified)
// 4. Stores oneResult links as a single object instead of array
import applyReducers from '../reducers/lib/applyReducers';
import cleanReducerLeftovers from '../reducers/lib/cleanReducerLeftovers';
import sift from 'sift';
import dot from 'dot-object';
import {Minimongo} from 'meteor/minimongo';

export default (node, params) => {
    snapBackCaches(node);
    storeOneResults(node, node.results);

    applyReducers(node, params);

    _.each(node.collectionNodes, collectionNode => {
        cloneMetaChildren(collectionNode, node.results)
    });

    _.each(node.collectionNodes, collectionNode => {
        assembleMetadata(collectionNode, node.results)
    });

    cleanReducerLeftovers(node, node.results);

    removeLinkStorages(node, node.results);

    applyPostFilters(node);
    applyPostOptions(node);
    applyPostFilter(node, params);
}

export function applyPostFilters(node) {
    const postFilters = node.props.$postFilters;
    if (postFilters) {
        node.results = node.results.filter(sift(postFilters));
    }
}

export function applyPostOptions(node) {
    const options = node.props.$postOptions;
    if (options) {
        if (options.sort) {
            const sorter = new Minimongo.Sorter(options.sort);
            node.results.sort(sorter.getComparator());
        }
        if (options.limit || options.skip) {
            const start = options.skip || 0;
            const end = options.limit ? options.limit + start : node.results.length;
            node.results = node.results.slice(start, end);
        }
    }
}


/**
 * Optionally applies a post filtering option
 */
function applyPostFilter(node, params) {
    if (node.props.$postFilter) {
        const filter = node.props.$postFilter;

        if (Array.isArray(filter)) {
            filter.forEach(f => {
                node.results = f(node.results, params);
            })
        } else {
            node.results = filter(node.results, params);
        }
    }
}

/**
 *
 * Helper function which transforms results into the array.
 * Results are an object for 'one' links.
 *
 * @param results
 * @return array
 */
export function getResultsArray(results) {
    if (Array.isArray(results)) {
        return results;
    }
    else if (_.isUndefined(results)) {
        return [];
    }
    return [results];
}

export function removeLinkStorages(node, sameLevelResults) {
    if (!sameLevelResults) {
        return;
    }

    sameLevelResults = getResultsArray(sameLevelResults);

    _.each(node.collectionNodes, collectionNode => {
        const removeStorageField = collectionNode.shouldCleanStorage;
        _.each(sameLevelResults, result => {
            if (removeStorageField) {
                const isSingle = collectionNode.linker.isSingle();
                const [root, ...nested] = collectionNode.linkStorageField.split('.');

                const removeFromResult = (result, removeEmptyRoot = false) => {
                    if (isSingle) {
                        dot.pick(collectionNode.linkStorageField, result, true);
                        if (removeEmptyRoot && nested.length > 0 && _.isEmpty(result[root])) {
                            delete result[root];
                        }
                    }
                    else {
                        if (nested.length > 0) {
                            const arr = result[root] || [];
                            if (Array.isArray(arr)) {
                                arr.forEach(obj => dot.pick(nested.join('.'), obj, true));
                                if (removeEmptyRoot && nested.length > 0 && arr.every(obj => _.isEmpty(obj))) {
                                    delete result[root];
                                }
                            }
                        }
                        else {
                            delete result[collectionNode.linkStorageField];
                        }
                    }
                };

                if (collectionNode.isVirtual) {
                    const childResults = getResultsArray(result[collectionNode.linkName]);
                    _.each(childResults, childResult => {
                        removeFromResult(childResult);
                    });
                } else {
                    removeFromResult(result);
                }
            }

            removeLinkStorages(collectionNode, result[collectionNode.linkName]);
        })
    })
}

export function storeOneResults(node, sameLevelResults) {
    if (!sameLevelResults || !Array.isArray(sameLevelResults)) {
        return;
    }

    node.collectionNodes.forEach(collectionNode => {
        _.each(sameLevelResults, result => {
            // The reason we are doing this is that if the requested link does not exist
            // It will fail when we try to get undefined[something] below
            if (!result) {
                return;
            }

            storeOneResults(collectionNode, result[collectionNode.linkName]);
        });

        if (collectionNode.isOneResult) {
            _.each(sameLevelResults, result => {
                if (result[collectionNode.linkName] && Array.isArray(result[collectionNode.linkName])) {
                    result[collectionNode.linkName] = result[collectionNode.linkName]
                        ? _.first(result[collectionNode.linkName])
                        : undefined;
                }
            })
        }
    })
}

function cloneMetaChildren(node, parentResults) {
    if (!parentResults) {
        return;
    }

    const linkName = node.linkName;
    const isMeta = node.isMeta;

    // parentResults might be an object (for type==one links)
    parentResults = getResultsArray(parentResults);

    parentResults.forEach(parentResult => {
        if (isMeta && parentResult[linkName]) {
            if (node.isOneResult) {
                parentResult[linkName] = Object.assign({}, parentResult[linkName]);
            }
            else {
                parentResult[linkName] = parentResult[linkName].map(object => {
                    return Object.assign({}, object);
                });
            }
        }

        node.collectionNodes.forEach(collectionNode => {
            cloneMetaChildren(collectionNode, parentResult[linkName]);
        });
    });
}

export function assembleMetadata(node, parentResults) {
    parentResults = getResultsArray(parentResults);

    // assembling metadata is depth first
    node.collectionNodes.forEach(collectionNode => {
        _.each(parentResults, result => {
            assembleMetadata(collectionNode, result[node.linkName])
        });
    });

    if (node.isMeta) {
        if (node.isVirtual) {
            _.each(parentResults, parentResult => {
                const childResult = parentResult[node.linkName];

                if (node.isOneResult) {
                    if (_.isObject(childResult)) {
                        const storage = childResult[node.linkStorageField];
                        storeMetadata(childResult, parentResult, storage, true);
                    }
                } else {
                    _.each(childResult, object => {
                        const storage = object[node.linkStorageField];
                        storeMetadata(object, parentResult, storage, true);
                    });
                }
            })
        } else {
            _.each(parentResults, parentResult => {
                const childResult = parentResult[node.linkName];
                const storage = parentResult[node.linkStorageField];

                if (node.isOneResult) {
                    if (childResult) {
                        storeMetadata(childResult, parentResult, storage, false);
                    }
                } else {
                    _.each(childResult, object => {
                        storeMetadata(object, parentResult, storage, false);
                    });
                }
            })
        }
    }
}

function storeMetadata(element, parentElement, storage, isVirtual) {
    if (isVirtual) {
        let $metadata;
        if (Array.isArray(storage)) {
            $metadata = _.find(storage, storageItem => storageItem._id == parentElement._id);
        } else {
            $metadata = storage;
        }

        element.$metadata = _.omit($metadata, '_id')
    } else {
        let $metadata;
        if (Array.isArray(storage)) {
            $metadata = _.find(storage, storageItem => storageItem._id == element._id);
        } else {
            $metadata = storage;
        }

        element.$metadata = _.omit($metadata, '_id');
    }
}

function snapBackCaches(node) {
    node.collectionNodes.forEach(collectionNode => {
        snapBackCaches(collectionNode);
    });

    if (!_.isEmpty(node.snapCaches)) {
        // process stuff
        _.each(node.snapCaches, (linkName, cacheField) => {
            const isSingle = _.contains(node.snapCachesSingles, cacheField);
            const linker = node.collection.getLinker(linkName);
            // we do this because for one direct and one meta direct, id is not stored
            const shoudStoreLinkStorage = !linker.isMany() && !linker.isVirtual();

            node.results.forEach(result => {
                if (result[cacheField]) {
                    if (shoudStoreLinkStorage) {
                        Object.assign(result[cacheField], {
                            _id: linker.isMeta()
                                ? result[linker.linkStorageField]._id
                                : result[linker.linkStorageField]
                        });
                    }

                    if (isSingle && Array.isArray(result[cacheField])) {
                        result[linkName] = _.first(result[cacheField]);
                    } else {
                        result[linkName] = result[cacheField];
                    }

                    delete result[cacheField];
                }
            })
        })
    }
}
