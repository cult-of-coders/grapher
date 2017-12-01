export default function applyReducers(root, params) {
    _.each(root.collectionNodes, node => {
        applyReducers(node, params);
    });

    _.each(root.reducerNodes, reducerNode => {
        root.results.forEach(result => {
            reducerNode.compute(result, params);
        });
    });
}