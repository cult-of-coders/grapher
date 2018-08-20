import sift from 'sift';
import cleanObjectForMetaFilters from './lib/cleanObjectForMetaFilters';

/**
 * This only applies to inversed links. It will assemble the data in a correct manner.
 */
export default function(childCollectionNode, aggregateResults, metaFilters) {
    const linker = childCollectionNode.linker;
    const linkStorageField = linker.linkStorageField;
    const linkName = childCollectionNode.linkName;
    const isMeta = linker.isMeta();
    const isMany = linker.isMany();

    let allResults = [];

    if (isMeta && metaFilters) {
        const metaFiltersTest = sift(metaFilters);
        _.each(childCollectionNode.parent.results, parentResult => {
            cleanObjectForMetaFilters(
                parentResult,
                linkStorageField,
                metaFiltersTest
            );
        });
    }

    if (isMeta && isMany) {
        // This case is treated differently because we get an array response from the pipeline.

        _.each(childCollectionNode.parent.results, parentResult => {
            parentResult[linkName] = parentResult[linkName] || [];

            const eligibleAggregateResults = _.filter(
                aggregateResults,
                aggregateResult => {
                    return _.contains(aggregateResult._id, parentResult._id);
                }
            );

            if (eligibleAggregateResults.length) {
                const datas = _.pluck(eligibleAggregateResults, 'data'); /// [ [x1, x2], [x2, x3] ]

                _.each(datas, data => {
                    _.each(data, item => {
                        parentResult[linkName].push(item);
                    });
                });
            }
        });

        _.each(aggregateResults, aggregateResult => {
            _.each(aggregateResult.data, item => allResults.push(item));
        });
    } else {
        let comparator;
        if (isMany) {
            comparator = (aggregateResult, result) =>
                _.contains(aggregateResult._id, result._id);
        } else {
            comparator = (aggregateResult, result) =>
                aggregateResult._id == result._id;
        }

        _.each(aggregateResults, aggregateResult => {
            let parentResult = _.find(
                childCollectionNode.parent.results,
                result => {
                    return comparator(aggregateResult, result);
                }
            );

            if (parentResult) {
                if (Array.isArray(parentResult[childCollectionNode.linkName])) {
                    parentResult[childCollectionNode.linkName].push(...aggregateResult.data);
                } else {
                    parentResult[childCollectionNode.linkName] = aggregateResult.data;
                }
            }

            _.each(aggregateResult.data, item => {
                allResults.push(item);
            });
        });
    }

    childCollectionNode.results = allResults;
}
