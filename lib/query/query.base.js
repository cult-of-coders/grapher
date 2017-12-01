import deepClone from 'lodash.clonedeep';
import {check} from 'meteor/check';

export default class QueryBase {
    isGlobalQuery = true;

    constructor(collection, body, options = {}) {
        this.collection = collection;

        this.body = deepClone(body);

        this.params = options.params || {};
        this.options = options;
    }

    clone(newParams) {
        const params = _.extend({}, deepClone(this.params), newParams);

        return new this.constructor(
            this.collection,
            deepClone(this.body),
            {
                params,
                ...this.options
            }
        );
    }

    get name() {
        return `exposure_${this.collection._name}`;
    }

    /**
     * Validates the parameters
     */
    doValidateParams() {
        const {validateParams} = this.options;
        if (!validateParams) return;

        if (_.isFunction(validateParams)) {
            validateParams.call(null, this.params)
        } else {
            check(this.params)
        }
    }

    /**
     * Merges the params with previous params.
     *
     * @param params
     * @returns {Query}
     */
    setParams(params) {
        this.params = _.extend({}, this.params, params);

        return this;
    }
}