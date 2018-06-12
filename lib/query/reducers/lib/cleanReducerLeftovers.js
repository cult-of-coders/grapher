import dot from 'dot-object';

/**
 * @param root
 */
export default function cleanReducerLeftovers(root) {
    _.each(root.collectionNodes, node => {
        if (node.scheduledForDeletion) {
            root.results.forEach(result => {
                delete result[node.linkName];
            })
        }
    });

    _.each(root.collectionNodes, node => {
        cleanReducerLeftovers(node);
    });

    _.each(root.fieldNodes, node => {
        if (node.scheduledForDeletion) {
            cleanNestedFields(node.name.split('.'), root.results, root);
        }
    });

    _.each(root.reducerNodes, node => {
        if (node.scheduledForDeletion) {
            root.results.forEach(result => {
                delete result[node.name];
            })
        }
    });
}

// if we store a field like: 'profile.firstName'
// then we need to delete profile: { firstName }
// if profile will have empty keys, we need to delete profile.

/**
 *
 * @param parts
 * @param results
 */
function cleanNestedFields(parts, results, root) {
    const snapCacheField = root.snapCaches[parts[0]];
    const fieldName = snapCacheField ? snapCacheField : parts[0];

    if (parts.length === 1) {

        results.forEach(result => {
            if (_.isObject(result) && fieldName !== '_id') {
                delete result[fieldName];
            }
        });

        return;
    }

    parts.shift();
    cleanNestedFields(parts, results.map(result => result[fieldName]), root);

    results.forEach(result => {
        if (_.isObject(result[fieldName]) && _.keys(result[fieldName]).length === 0) {
            if (fieldName !== '_id') {
                delete result[fieldName];
            }
        }
    })
}
