export default (value) => {
    if (_.isUndefined(value)) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
};
