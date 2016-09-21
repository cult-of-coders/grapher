import applyProps from '../lib/applyProps.js';
import AggregateFilters from './aggregateFilters.js';

export default function storeHypernovaResults(collectionNode, userId) {
    if (collectionNode.parent.results.length === 0) {
        return collectionNode.results = [];
    }

    let {filters, options} = applyProps(collectionNode);

    const aggregateFilters = new AggregateFilters(collectionNode);
    const linker = collectionNode.linker;
    const isVirtual = linker.isVirtual();

    _.extend(filters, aggregateFilters.create());

    // for one, one-meta, virtual or not, there is no need for aggregate query.
    // same rule applies for many, many-meta but no virtual
    const collection = collectionNode.collection;
    if (linker.isSingle() || (linker.isMany() && !isVirtual)) {
        if (collection.findSecure) {
            return collection.findSecure(filters, {}, userId).fetch();
        } else {
            return collection.find(filters, {}, userId).fetch();
        }
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
                _id: '$' + _id,
                data: {$slice}
            }
        })
    }

    const result = collectionNode.collection.aggregate(pipeline, {explains: true});

    let results = [];
    _.each(result, aggregateResult => {
        _.each(aggregateResult.data, item => results.push(item))
    });

    collectionNode.results = results;
}