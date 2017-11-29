// 1. Clone children with meta relationships
// 2. Apply $metadata to children
// 3. Removes link storage (if not specified)
// 4. Stores oneResult links as a single object instead of array
import applyReducers from '../reducers/lib/applyReducers';
import cleanReducerLeftovers from '../reducers/lib/cleanReducerLeftovers';
import sift from 'sift';
import {Minimongo} from 'meteor/minimongo';

export default (node) => {
    snapBackCaches(node);
    applyReducers(node);
    cleanReducerLeftovers(node);
    applyPostFilters(node);
    applyPostOptions(node);

    _.each(node.collectionNodes, collectionNode => {
        cloneMetaChildren(collectionNode, node.results)
    });

    _.each(node.collectionNodes, collectionNode => {
        assembleMetadata(collectionNode, node.results)
    });

    removeLinkStorages(node, node.results);
    storeOneResults(node, node.results);

    node.postFilter();
}

export function applyPostFilters(node) {
    const postFilters = node.props.$postFilters || node.props.$postFilter;
    if (postFilters) {
        node.results = sift(postFilters, node.results);
    }

    node.collectionNodes.forEach(collectionNode => {
        applyPostFilters(collectionNode);
    })
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
 
    node.collectionNodes.forEach(collectionNode => {
        applyPostOptions(collectionNode);
    })
}

export function removeLinkStorages(node, sameLevelResults) {
    if (!sameLevelResults) {
        return;
    }

    _.each(node.collectionNodes, collectionNode => {
        const removeStorageField = collectionNode.shouldCleanStorage;
        _.each(sameLevelResults, result => {
            if (removeStorageField) {
                delete result[collectionNode.linkStorageField];
            }

            removeLinkStorages(collectionNode, result[collectionNode.linkName]);
        })
    })
}

export function storeOneResults(node, sameLevelResults) {
    if (!sameLevelResults) {
        return;
    }

    node.collectionNodes.forEach(collectionNode => {
        _.each(sameLevelResults, result => {
            storeOneResults(collectionNode, result[collectionNode.linkName]);
        });

        if (collectionNode.isOneResult) {
            sameLevelResults.forEach(result => {
                if (result[collectionNode.linkName] && _.isArray(result[collectionNode.linkName])) {
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

    parentResults.forEach(parentResult => {
        if (isMeta && parentResult[linkName]) {
            parentResult[linkName] = parentResult[linkName].map(object => {
                return Object.assign({}, object);
            });
        }

        node.collectionNodes.forEach(collectionNode => {
            cloneMetaChildren(collectionNode, parentResult[linkName]);
        });
    });
}

export function assembleMetadata(node, parentResults) {
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

                _.each(childResult, object => {
                    const storage = object[node.linkStorageField];

                    storeMetadata(object, parentResult, storage, true);
                });
            })
        } else {
            _.each(parentResults, parentResult => {
                const childResult = parentResult[node.linkName];
                const storage = parentResult[node.linkStorageField];

                _.each(childResult, object => {
                    storeMetadata(object, parentResult, storage, false);
                });
            })
        }
    }
}

function storeMetadata(element, parentElement, storage, isVirtual) {
    if (isVirtual) {
        let $metadata;
        if (_.isArray(storage)) {
            $metadata = _.find(storage, storageItem => storageItem._id == parentElement._id);
        } else {
            $metadata = storage;
        }

        element.$metadata = _.omit($metadata, '_id')
    } else {
        let $metadata;
        if (_.isArray(storage)) {
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

                    if (isSingle && _.isArray(result[cacheField])) {
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
