import sift from 'sift';
import dot from 'dot-object';
import cleanObjectForMetaFilters from './lib/cleanObjectForMetaFilters';

function getSlicedResults(results, limit, skip) {
    if (_.isFinite(limit) || _.isFinite(skip)) {
        skip = skip || 0;
        return results.slice(skip, !_.isFinite(limit) ? undefined : skip + limit);
    }
    return results;
}

/**
 * This only applies to inversed links. It will assemble the data in a correct manner.
 */
export default function(childCollectionNode, results, metaFilters, options = {}) {
    const {limit, skip} = options;
    const linker = childCollectionNode.linker;
    const linkStorageField = linker.linkStorageField;
    const linkField = linkStorageField + (linker.isMeta() ? '._id' : '');
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

            const eligibleResults = _.filter(
                results,
                result => {
                    // console.log('testing', parentResult._id, (result[linkStorageField] || []).map(value => value._id));
                    return _.contains((result[linkStorageField] || []).map(value => value._id), parentResult._id);
                },
            );

            if (eligibleResults.length) {
                parentResult[linkName].push(...getSlicedResults(eligibleResults, limit, skip));
            }
        });

        _.each(results, result => {
            allResults.push(result);
        });
    } else {
        let comparator;
        if (isMany) {
            comparator = (result, parent) => {
                const [root, ...nestedFields] = linkField.split('.');
                if (nestedFields.length > 0) {
                    return _.contains((result[root] || []).map(nestedObject => dot.pick(nestedFields.join('.'), nestedObject)), parent._id);
                }
                return _.contains(result[linkField], parent._id);
            };
        } else {
            comparator = (result, parent) =>
                dot.pick(linkField, result) == parent._id;
        }

        const childLinkName = childCollectionNode.linkName;
        const parentResults = childCollectionNode.parent.results;

        parentResults.forEach(parentResult => {
            // We are now finding the data from the pipeline that is related to the _id of the parent
            const eligibleResults = results.filter(
                result => comparator(result, parentResult)
            );

            getSlicedResults(eligibleResults, limit, skip).forEach(result => {
                if (Array.isArray(parentResult[childLinkName])) {
                    parentResult[childLinkName].push(result);
                } else {
                    parentResult[childLinkName] = [result];
                }
            });
        });

        results.forEach(result => {
            allResults.push(result);
        });
    }

    childCollectionNode.results = allResults;
}
