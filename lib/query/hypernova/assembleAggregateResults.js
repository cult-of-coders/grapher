/**
 * This only applies to inversed links. It will assemble the data in a correct manner.
 */
export default function (childCollectionNode, aggregateResults) {
    const linker = childCollectionNode.linker;
    const linkStorageField = linker.linkStorageField;
    const linkName = childCollectionNode.linkName;
    const isMeta = linker.isMeta();

    let allResults = [];

    if (isMeta && linker.isMany()) {
        // This case is treated differently because we get an array response from the pipeline.

        _.each(childCollectionNode.parent.results, parentResult => {
            parentResult[linkName] = parentResult[linkName] || [];

            const eligibleAggregateResults = _.filter(aggregateResults, aggregateResult => {
                return _.contains(aggregateResult._id, parentResult._id)
            });

            if (eligibleAggregateResults.length) {
                const datas = _.pluck(eligibleAggregateResults, 'data'); /// [ [x1, x2], [x2, x3] ]

                _.each(datas, data => {
                    _.each(data, item => {
                        // build $metadata field
                        item.$metadata = _.omit(
                            _.find(item[linkStorageField], element => {
                                return element._id == parentResult._id;
                            }),
                            '_id'
                        );

                        parentResult[linkName].push(item)
                    })
                });
            }
        });

        _.each(aggregateResults, aggregateResult => {
            _.each(aggregateResult.data, item => allResults.push(item))
        });
    } else {
        _.each(aggregateResults, aggregateResult => {
            let parentResult = _.find(childCollectionNode.parent.results, (result) => {
                return result._id == aggregateResult._id;
            });

            if (parentResult) {
                parentResult[childCollectionNode.linkName] = aggregateResult.data;
                // build $metadata field
                if (isMeta) { // if isMeta here then it must be single.
                    _.each(aggregateResult.data, item => {
                        item.$metadata = _.omit(item[linkStorageField], '_id');
                    });
                }
            }

            _.each(aggregateResult.data, item => {
                allResults.push(item)
            });
        });
    }

    // cleaning up
    if (!childCollectionNode.hasLinkStorageFieldSpecified()) {
        _.each(allResults, item => {
            delete item[linkStorageField];
        });
    }

    childCollectionNode.results = allResults;
}