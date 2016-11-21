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
            root.results.forEach(result => {
                delete result[node.name];
            })
        }
    });
}