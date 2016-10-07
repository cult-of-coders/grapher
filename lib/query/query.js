import createGraph from './lib/createGraph.js';
import recursiveFetch from './lib/recursiveFetch.js';
import applyFilterFunction from './lib/applyFilterFunction.js';
import hypernova from './hypernova/hypernova.js';
import deepClone from './lib/deepClone.js';

export default class Query {
    constructor(collection, body, params = {}) {
        this.collection = collection;
        this.body = body;
        this.subscriptionHandle = null;
        this._params = params;
    }

    clone(newParams) {
        return new Query(
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

    get props() {
        const body = applyFilterFunction(this.body, this.params);
        return {
            filters: body.$filters,
            options: body.$options
        }
    }

    /**
     * Subscribe
     *
     * @param callback
     * @returns {null|any|*}
     */
    subscribe(callback) {
        if (!Meteor.isClient) {
            throw new Meteor.Error('not-allowed', 'You cannot subscribe from server');
        }

        this.subscriptionHandle = Meteor.subscribe(
            this.name,
            applyFilterFunction(this.body, this.params),
            callback
        );

        return this.subscriptionHandle;
    }

    /**
     * Unsubscribe if an existing subscription exists
     */
    unsubscribe() {
        if (!Meteor.isClient) {
            throw new Meteor.Error('not-allowed', 'You cannot subscribe/unsubscribe from server');
        }

        if (this.subscriptionHandle) {
            this.subscriptionHandle.stop();
        }

        this.subscriptionHandle = null;
    }

    /**
     * Retrieves the data.
     * @param callbackOrOptions
     * @returns {*}
     */
    fetch(callbackOrOptions) {
        if (Meteor.isClient) {
            if (!this.subscriptionHandle) {
                return this._fetchAsClientMethod(callbackOrOptions)
            } else {
                return this._fetchAsClientReactive(callbackOrOptions);
            }
        } else {
            return this._fetchAsServer(callbackOrOptions);
        }
    }

    /**
     * @param args
     * @returns {*}
     */
    fetchOne(...args) {
        return _.first(this.fetch(...args));
    }

    /**
     * Gets the count of matching elements.
     * @param callback
     * @returns {any}
     */
    getCount(callback) {
        if (Meteor.isClient) {
            if (!callback) {
                throw new Meteor.Error('not-allowed', 'You are on client so you must either provide a callback to get the count.');
            }

            return Meteor.call(this.name + '.count', applyFilterFunction(this.body, this.params), callback);
        }

        return this.collection.find(this.body.$filters || {}, {}).count();
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

    /**
     * Fetching non-reactive queries
     * @param callback
     * @private
     */
    _fetchAsClientMethod(callback) {
        if (!callback) {
            throw new Meteor.Error('not-allowed', 'You are on client so you must either provide a callback to get the data or subscribe first.');
        }

        Meteor.call(this.name, applyFilterFunction(this.body, this.params), callback);
    }

    /**
     * Fetching when we've got an active publication
     *
     * @param options
     * @returns {*}
     * @private
     */
    _fetchAsClientReactive(options = {}) {
        let body = applyFilterFunction(this.body, this.params);
        if (!options.allowSkip && body.$options && body.$options.skip) {
            delete body.$options.skip;
        }

        return recursiveFetch(
            createGraph(this.collection, body)
        );
    }

    /**
     * Fetching from the server-side
     *
     * @param options
     * @private
     */
    _fetchAsServer(options = {}) {
        const node = createGraph(
            this.collection,
            applyFilterFunction(this.body, this.params)
        );

        return hypernova(node, options.userId);
    }
}