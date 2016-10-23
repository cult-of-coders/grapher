export default function (object, field, metaFiltersTest) {
    if (object[field]) {
        if (_.isArray(object[field])) {
            object[field] = object[field].filter(metaFiltersTest)
        } else {
            if (!metaFiltersTest(object[field])) {
                object[field] = null;
            }
        }
    }
}