/**
 * @param {[niceField: string]: bodyToExpandTo} map
 */
export default function addExpanders(map) {
    const collection = this;
    let reducers = {};
    for (let key in map) {
        reducers[key] = {
            body: map[key],
            expand: true,
        };
    }

    collection.addReducers(reducers);
}
