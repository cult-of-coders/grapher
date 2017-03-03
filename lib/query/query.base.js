import deepClone from './lib/deepClone.js';

export default class QueryBase {
    constructor(collection, body, params = {}) {
        this.collection = collection;

        this.body = deepClone(body);
        Object.freeze(this.body);

        this._params = params;
    }

    clone(newParams) {
        return new this.constructor(
            this.collection,
            deepClone(this.body),
            _.extend({}, deepClone(this.params), newParams)
        );
    }

    get name() {
        return `exposure_${this.collection._name}`;
    }

    get params() {
        return this._params;
    }

    /**
     * Merges the params with previous params.
     *
     * @param data
     * @returns {Query}
     */
    setParams(data) {
        _.extend(this._params, data);

        return this;
    }
}