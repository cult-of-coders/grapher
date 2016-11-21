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
            cleanNestedFields(node.name.split('.'), root.results);
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
function cleanNestedFields(parts, results) {
    const fieldName = parts[0];
    if (parts.length === 1) {

        results.forEach(result => {
            delete result[fieldName];
        });

        return;
    }

    parts.shift();
    cleanNestedFields(parts, results.map(result => result[fieldName]));

    results.forEach(result => {
        if (_.keys(result[fieldName]).length === 0) {
            delete result[fieldName];
        }
    })
}
