import applyProps from '../lib/applyProps.js';
import AggregateFilters from './aggregateSearchFilters.js';
import assemble from './assembler.js';

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

    // for one, one-meta, virtual or not, there is no need for aggregate query.
    // same rule applies for many, many-meta but no virtual
    if (!isVirtual) {
        const filteredOptions = _.omit(options, 'limit');

        if (collection.findSecure) {
            childCollectionNode.results = collection.findSecure(filters, filteredOptions, userId).fetch();
        } else {
            childCollectionNode.results = collection.find(filters, filteredOptions, userId).fetch();
        }

        assemble(childCollectionNode);
    }

    // many, many-meta and virtual arrive here
    let pipeline = [];

    pipeline.push({$match: filters});

    if (options.sort) {
        pipeline.push({$sort: options.sort})
    }

    let _id = aggregateFilters.linkStorageField;
    if (linker.isMeta()) {
        _id += '._id';
    }

    let dataPush = {};
    _.each(options.fields, (value, field) => {
        dataPush[field] = '$' + field
    });

    if (!dataPush._id) {
        dataPush['_id'] = '$_id';
    }

    dataPush[aggregateFilters.linkStorageField] = '$' + aggregateFilters.linkStorageField;

    pipeline.push({
        $group: {
            _id: "$" + _id,
            data: {
                $push: dataPush
            }
        }
    });

    if (options.limit || options.skip) {
        let $slice = ["$data"];
        if (options.skip) $slice.push(options.skip);
        if (options.limit) $slice.push(options.limit);

        pipeline.push({
            $project: {
                _id: 1,
                data: {$slice}
            }
        })
    }

    const aggregateResults = childCollectionNode.collection.aggregate(pipeline, {explains: true});
    let results = [];

    _.each(aggregateResults, aggregateResult => {
        const parentResult = _.find(childCollectionNode.parent.results, (result) => {
            return result._id === aggregateResult._id;
        });

        if (parentResult) {
            parentResult[childCollectionNode.linkName] = aggregateResult.data;
        }

        _.each(aggregateResult.data, item => results.push(item))
    });

    childCollectionNode.results = results;
}