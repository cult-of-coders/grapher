export default function (options, maxLimit) {
    if (maxLimit === undefined) {
        return;
    }

    if (options.limit) {
        if (options.limit > maxLimit) {
            options.limit = maxLimit;
        }
    } else {
        options.limit = maxLimit;
    }
}