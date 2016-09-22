export default function (childCollectionNode, aggregateResults) {
    const linker = childCollectionNode.linker;
    const linkName = childCollectionNode.linkName;

    let allResults = [];

    if (linker.isMeta() && linker.isMany()) {
        _.each(childCollectionNode.parent.results, parentResult => {
            parentResult[linkName] = parentResult[linkName] || [];

            const eligibleAggregateResults = _.filter(aggregateResults, aggregateResult => {
                return _.contains(aggregateResult._id, parentResult._id)
            });

            if (eligibleAggregateResults.length) {
                const datas = _.pluck(eligibleAggregateResults, 'data'); /// [ [x1, x2], [x2, x3] ]

                _.each(datas, item => parentResult[linkName].push(item));
            }
        });

        _.each(aggregateResults, aggregateResult => {
            _.each(aggregateResult.data, item => allResults.push(item))
        });
    } else {
        _.each(aggregateResults, aggregateResult => {
            const parentResult = _.find(childCollectionNode.parent.results, (result) => {
                return result._id === aggregateResult._id;
            });

            if (parentResult) {
                parentResult[childCollectionNode.linkName] = aggregateResult.data;
            }

            _.each(aggregateResult.data, item => allResults.push(item))
        });
    }

    childCollectionNode.results = allResults;
}