import applyProps from '../lib/applyProps.js';
import AggregateFilters from './aggregateSearchFilters.js';
import assemble from './assembler.js';
import processVirtualNode from './processVirtualNode.js';
import buildVirtualNodeProps from './buildVirtualNodeProps.js';

export default function storeHypernovaResults(childCollectionNode, userId) {
    if (childCollectionNode.parent.results.length === 0) {
        return (childCollectionNode.results = []);
    }

    let { filters, options } = applyProps(childCollectionNode);

    const metaFilters = filters.$meta;
    const aggregateFilters = new AggregateFilters(
        childCollectionNode,
        metaFilters
    );
    delete filters.$meta;

    const linker = childCollectionNode.linker;
    const isVirtual = linker.isVirtual();
    const collection = childCollectionNode.collection;

    _.extend(filters, aggregateFilters.create());

    // if it's not virtual then we retrieve them and assemble them here.
    if (!isVirtual) {
        const filteredOptions = _.omit(options, 'limit');

        childCollectionNode.results = collection
            .find(filters, filteredOptions, userId)
            .fetch();

        assemble(childCollectionNode, {
            ...options,
            metaFilters,
        });
    } else {
        // virtuals arrive here
        const virtualProps = buildVirtualNodeProps(
            childCollectionNode,
            filters,
            options,
            userId
        );

        const {filters: virtualFilters, options: {limit, skip, ...virtualOptions}} = virtualProps;

        // console.log(JSON.stringify(virtualProps, null, 4));
        
        const results = collection.find(virtualFilters, virtualOptions).fetch();

        // console.log(JSON.stringify(results, null, 4));

        processVirtualNode(
            childCollectionNode,
            results,
            metaFilters,
            {limit, skip},
        );
    }
}
