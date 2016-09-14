import createGraph from './lib/createGraph.js';
import recursiveFetch from './lib/recursiveFetch.js';
import applyFilterFunction from './lib/applyFilterFunction.js';

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

    subscribe() {
        if (!Meteor.isClient) {
            throw new Meteor.Error('not-allowed', 'You cannot subscribe from server');
        }

        this.subscriptionHandle = Meteor.subscribe(
            this.name,
            applyFilterFunction(this.body, this.params)
        );

        return this.subscriptionHandle;
    }

    unsubscribe() {
        if (!Meteor.isClient) {
            throw new Meteor.Error('not-allowed', 'You cannot subscribe from server');
        }

        if (this.subscriptionHandle) {
            this.subscriptionHandle.stop();
        }
    }

    fetch(callback) {
        if (Meteor.isClient && !callback && !this.subscriptionHandle) {
            throw new Meteor.Error('not-allowed', 'You are on client so you must either provide a callback to get the data or subscribe first.');
        }

        if (Meteor.isServer && callback) {
            throw new Meteor.Error('not-allowed', 'You are on server, fetching is done directly so no need for callback.');
        }

        if (Meteor.isClient) {
            // do method call with callback
            if (!this.subscriptionHandle) {
                Meteor.call(this.name, applyFilterFunction(this.body, this.params), callback);
            } else {
                const node = createGraph(
                    this.collection,
                    applyFilterFunction(this.body, this.params)
                );

                return recursiveFetch(node);
            }
        } else {
            // fetch directly, he is from server
            const node = createGraph(
                this.collection,
                applyFilterFunction(this.body, this.params)
            );

            return recursiveFetch(node);
        }
    }

    fetchOne(...args) {
        return _.first(this.fetch(...args));
    }

    setParams(data) {
        _.extend(this._params, data);

        if (this.subscriptionHandle) {
            this.subscribe();
        }
    }
}