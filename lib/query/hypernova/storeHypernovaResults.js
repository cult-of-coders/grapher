import applyProps from '../lib/applyProps.js';
import AggregateFilters from './aggregateSearchFilters.js';
import assemble from './assembler.js';
import assembleAggregateResults from './assembleAggregateResults.js';
import buildAggregatePipeline from './buildAggregatePipeline.js';

export default function storeHypernovaResults(childCollectionNode, userId) {
    if (childCollectionNode.parent.results.length === 0) {
        return childCollectionNode.results = [];
    }

    let {filters, options} = applyProps(childCollectionNode);

    const aggregateFilters = new AggregateFilters(childCollectionNode);
    const linker = childCollectionNode.linker;
    const isVirtual = linker.isVirtual();
    const collection = childCollectionNode.collection;

    _.extend(filters, aggregateFilters.create());

    // if it's not virtual then we retrieve them and assemble them here.
    if (!isVirtual) {
        const filteredOptions = _.omit(options, 'limit');

        if (collection.findSecure) {
            childCollectionNode.results = collection.findSecure(filters, filteredOptions, userId).fetch();
        } else {
            childCollectionNode.results = collection.find(filters, filteredOptions, userId).fetch();
        }

        assemble(childCollectionNode, options.limit);
    } else {
        // virtuals arrive here
        let pipeline = buildAggregatePipeline(childCollectionNode, filters, options, userId);

        const aggregateResults = collection.aggregate(pipeline, {explains: true});

        assembleAggregateResults(childCollectionNode, aggregateResults);
    }
}