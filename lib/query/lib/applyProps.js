const restrictOptions = [
    'disableOplog',
    'pollingIntervalMs',
    'pollingThrottleMs'
];

export default function applyProps(node) {
    let filters = _.extend({}, node.props.$filters);
    let options = _.extend({}, node.props.$options);

    options = _.omit(options, ...restrictOptions);
    options.fields = options.fields || {};

    node.applyFields(filters, options);

    return {filters, options};
}
