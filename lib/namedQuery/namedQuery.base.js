import deepClone from 'lodash.clonedeep';

let globalConfig = {};

export default class NamedQueryBase {
    static setConfig(config) {
        globalConfig = config;
    }

    static getConfig() {
        return globalConfig;
    }

    isNamedQuery = true;

    constructor(name, collection, body, options = {}) {
        this.queryName = name;

        if (_.isFunction(body)) {
            this.resolver = body;
        } else {
            this.body = deepClone(body);
        }

        this.subscriptionHandle = null;
        this.params = options.params || {};
        this.options = Object.assign({}, globalConfig, options);
        this.collection = collection;
        this.isExposed = false;
    }

    get name() {
        return `named_query_${this.queryName}`;
    }

    get isResolver() {
        return !!this.resolver;
    }

    setParams(params) {
        this.params = _.extend({}, this.params, params);

        return this;
    }

    /**
     * Validates the parameters
     */
    doValidateParams(params) {
        params = params || this.params;

        const {validateParams} = this.options;
        if (!validateParams) return;

        try {
            this._validate(validateParams, params);
        } catch (validationError) {
            console.error(`Invalid parameters supplied to the query "${this.queryName}"\n`, validationError);
            throw validationError; // rethrow
        }
    }

    clone(newParams) {
        const params = _.extend({}, deepClone(this.params), newParams);

        let clone = new this.constructor(
            this.queryName,
            this.collection,
            this.isResolver ? this.resolver : deepClone(this.body),
            {
                ...this.options,
                params,
            }
        );

        clone.cacher = this.cacher;
        if (this.exposeConfig) {
            clone.exposeConfig = this.exposeConfig;
        }

        return clone;
    }

    /**
     * @param {function|object} validator
     * @param {object} params
     * @private
     */
    _validate(validator, params) {
        if (_.isFunction(validator)) {
            validator.call(null, params)
        } else {
            check(params, validator)
        }
    }
}

NamedQueryBase.defaultOptions = {};