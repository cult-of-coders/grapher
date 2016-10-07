import createGraph from '../query/lib/createGraph.js';
import recursiveCompose from '../query/lib/recursiveCompose.js';
import recursiveFetch from '../query/lib/recursiveFetch.js';
import applyFilterFunction from '../query/lib/applyFilterFunction.js';

export default class NamedQuery {
    constructor(name, collection, body, params = {}) {
        this.queryName = name;
        this.body = body;
        this.subscriptionHandle = null;
        this.params = params;
        this.collection = collection;
        this.isExposed = false;
    }

    get name() {
        return `named_query_${this.queryName}`;
    }

    clone(newParams) {
        return new NamedQuery(
            this.queryName,
            this.collection,
            _.clone(this.body),
            _.extend({}, this.params, newParams)
        );
    }

    setParams(params) {
        this.params = _.extend({}, this.params, params);

        return this;
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
            this.params,
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

            return Meteor.call(this.name + '.count', this.params, callback);
        }

        let body = applyFilterFunction(this.body, this.params);
        return this.collection.find(body.$filters || {}, {}).count();
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

        Meteor.call(this.name, this.params, callback);
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
     * @private
     */
    _fetchAsServer() {
        const query = this.collection.createQuery(this.body, this.params);

        return query.fetch();
    }
}