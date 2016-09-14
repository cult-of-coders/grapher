const restrictOptions = [
    'disableOplog',
    'pollingIntervalMs',
    'pollingThrottleMs'
];

export default function applyProps(node, filters, options) {
    _.extend(filters, node.props.$filters || {});
    _.extend(options, node.props.$options || {});

    options = _.omit(options, ...restrictOptions);
    options.fields = options.fields || {};

    _.each(node.fieldNodes, (fieldNode) => {
        fieldNode.applyFields(options.fields);
    });

    // if at this stage it is empty we assume we want all fields.
    if (!_.keys(options.fields).length) {
        return;
    }

    // it will only get here if it has collectionNodes children
    _.each(node.collectionNodes, (collectionNode) => {
        let linker = collectionNode.linker;
        options.fields[linker.linkStorageField] = 1;
    });
}
