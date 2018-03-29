/**
 * @param {[niceField: string]: dbField} map
 */
export default function addFieldMap(map) {
    const collection = this;
    let reducers = {};
    for (let key in map) {
        const dbField = map[key];
        reducers[key] = {
            body: {
                [dbField]: 1,
            },
            reduce(obj) {
                return obj[dbField];
            },
        };
    }

    collection.addReducers(reducers);
}
