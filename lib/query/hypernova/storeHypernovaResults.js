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

    // if it's not virtual then we retrieve them and assemble them here.
    if (!isVirtual) {
        const filteredOptions = _.omit(options, 'limit');

        if (collection.findSecure) {
            childCollectionNode.results = collection.findSecure(filters, filteredOptions, userId).fetch();
        } else {
            childCollectionNode.results = collection.find(filters, filteredOptions, userId).fetch();
        }

        assemble(childCollectionNode);

        return;
    }

    // virtuals arrive here
    let pipeline = [];
    const linkStorageField = aggregateFilters.linkStorageField;

    if (collection.firewall) {
        collection.firewall(filters, options, userId);
    }

    pipeline.push({$match: filters});

    if (options.sort) {
        pipeline.push({$sort: options.sort})
    }

    let _id = linkStorageField;
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

    dataPush[linkStorageField] = '$' + linkStorageField;


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

    const aggregateResults = collection.aggregate(pipeline, {explains: true});

    let results = [];

    const linkName = childCollectionNode.linkName;

    if (linker.isMany()) {
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
            _.each(aggregateResult.data, item => results.push(item))
        });
    } else {
        _.each(aggregateResults, aggregateResult => {
            const parentResult = _.find(childCollectionNode.parent.results, (result) => {
                return result._id === aggregateResult._id;
            });

            if (parentResult) {
                parentResult[childCollectionNode.linkName] = aggregateResult.data;
            }

            _.each(aggregateResult.data, item => results.push(item))
        });
    }


    childCollectionNode.results = results;
}