import createGraph from './lib/createGraph.js';
import recursiveFetch from './lib/recursiveFetch.js';
import applyFilterFunction from './lib/applyFilterFunction.js';
import hypernova from './hypernova/hypernova.js';

export default class Query {
    constructor(collection, body, params = {}) {
        this.collection = collection;
        this.body = body;
        this.subscriptionHandle = null;
        this._params = params;
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

    subscribe(callback) {
        if (!Meteor.isClient) {
            throw new Meteor.Error('not-allowed', 'You cannot subscribe from server');
        }

        console.log(applyFilterFunction(this.body, this.params));

        this.subscriptionHandle = Meteor.subscribe(
            this.name,
            applyFilterFunction(this.body, this.params),
            callback
        );

        return this.subscriptionHandle;
    }

    unsubscribe() {
        if (!Meteor.isClient) {
            throw new Meteor.Error('not-allowed', 'You cannot subscribe/unsubscribe from server');
        }

        if (this.subscriptionHandle) {
            this.subscriptionHandle.stop();
        }

        this.subscriptionHandle = null;
    }

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

    getCount(callback) {
        if (Meteor.isClient && !callback) {
            throw new Meteor.Error('not-allowed', 'You are on client so you must either provide a callback to get the count.');
        }

        return Meteor.call(this.name + '.count', applyFilterFunction(this.body, this.params), callback);
    }

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