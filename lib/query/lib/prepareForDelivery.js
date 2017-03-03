// 1. Clone children with meta relationships
// 2. Apply $metadata to children
// 3. Removes link storage (if not specified)
// 4. Stores oneResult links as a single object instead of array
import applyReducers from '../reducers/lib/applyReducers';
import cleanReducerLeftovers from '../reducers/lib/cleanReducerLeftovers';
import sift from 'sift';

export default (node) => {
    applyReducers(node);
    cleanReducerLeftovers(node);
    applyPostFilter(node);

    _.each(node.collectionNodes, collectionNode => {
        cloneMetaChildren(collectionNode, node.results)
    });

    _.each(node.collectionNodes, collectionNode => {
        assembleMetadata(collectionNode, node.results)
    });

    removeLinkStorages(node, node.results);

    storeOneResults(node, node.results);
}

export function applyPostFilter(node) {
    if (node.props.$postFilter) {
        node.results = sift(node.props.$postFilter, node.results);
    }

    node.collectionNodes.forEach(collectionNode => {
        applyPostFilter(collectionNode);
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
    node.collectionNodes.forEach(collectionNode => {
        const linkName = collectionNode.linkName;

        _.each(parentResults, result => {
            assembleMetadata(collectionNode, result[linkName])
        });
    });

    if (node.isMeta) {
        if (node.isVirtual) {
            _.each(parentResults, parentResult => {
                const childResult = parentResult[node.linkName];

                _.each(childResult, object => {
                    const storage = object[node.linkStorageField];
                    return storeMetadata(object, parentResult, storage, true);
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

// /**
//  * @param elements
//  * @param storage
//  * @returns {Array}
//  */
// function assembleMetadata(elements, storage) {
//     if (_.isArray(storage)) {
//         return _.map(elements, element => {
//             element.$metadata = _.find(storage, (storageMetadata) => {
//                 return element._id == storageMetadata._id
//             });
//
//             return _.extend({}, element, {
//                 $metadata: _.omit(element.$metadata, '_id')
//             });
//         })
//     } else {
//         return _.map(elements, element => {
//             return _.extend({}, element, {
//                 $metadata: _.omit(storage, '_id')
//             })
//         })
//     }
// }
