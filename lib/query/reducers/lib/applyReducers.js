export default function applyReducers(root) {
    _.each(root.collectionNodes, node => {
        applyReducers(node);
    });

    _.each(root.reducerNodes, reducerNode => {
        root.results.forEach(result => {
            reducerNode.compute(result);
        });
    });
}