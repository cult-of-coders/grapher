const restrictOptions = [
    'disableOplog',
    'pollingIntervalMs',
    'pollingThrottleMs'
];

export default function applyProps(node) {
    let filters = _.extend({}, node.props.$filters);
    let options =_ .extend({},node.props.$options);

    options = _.omit(options, ...restrictOptions);
    options.fields = options.fields || {};

    _.each(node.fieldNodes, (fieldNode) => {
        fieldNode.applyFields(options.fields);
    });

    // if he selected filters, we should automatically add those fields
    _.each(filters, (value, field) => {
         if (!node.hasField(field)) {
             options.fields[field] = 1;
         }
    });

    if (!node.fieldNodes.length) {
        options.fields._id = 1;
    }

    // it will only get here if it has collectionNodes children
    _.each(node.collectionNodes, (collectionNode) => {
        let linker = collectionNode.linker;
        options.fields[linker.linkStorageField] = 1;
    });

    return {filters, options};
}
