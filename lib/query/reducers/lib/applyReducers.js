export default async function applyReducers(root, params) {
     // Process each collection node asynchronously
     await Promise.all(
        Object.values(root.collectionNodes).map(async (node) => {
            await applyReducers(node, params);
        })
    );

    const processedReducers = [];
    let reducersQueue = [...root.reducerNodes];

    // TODO: find out if there's an infinite reducer inter-deendency

    while (reducersQueue.length) {
        const reducerNode = reducersQueue.shift();

        // If this reducer depends on other reducers
        if (reducerNode.dependencies.length) {
            // If there is an unprocessed reducer, move it at the end of the queue
            const allDependenciesComputed = reducerNode.dependencies.every(dep => 
                processedReducers.includes(dep)
            );
            if (allDependenciesComputed) {
                // Process results asynchronously
                await Promise.all(root.results.map(async (result) => {
                    await reducerNode.compute(result, params);
                }));
                processedReducers.push(reducerNode.name);
            } else {
                // Move it at the end of the queue
                reducersQueue.push(reducerNode);
            }
        } else {
             // Process results asynchronously
            await Promise.all(root.results.map(async (result) => {
                await reducerNode.compute(result, params);
            }));

            processedReducers.push(reducerNode.name);
        }
    }
}
