import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';

import createGraph from '../query/lib/createGraph.js';
import recursiveFetch from '../query/lib/recursiveFetch.js';
import prepareForProcess from '../query/lib/prepareForProcess.js';
import { _ } from 'meteor/underscore';
import callWithPromise from '../query/lib/callWithPromise';
import Base from './namedQuery.base';

import { COUNTS_COLLECTION_CLIENT } from './constants';

const Counts = new Mongo.Collection(COUNTS_COLLECTION_CLIENT);

export default class extends Base {
    /**
     * Subscribe
     *
     * @param callback
     * @returns {null|any|*}
     */
    subscribe(callback) {
        this.subscriptionHandle = Meteor.subscribe(
            this.name,
            this.params,
            callback
        );

        return this.subscriptionHandle;
    }

    /**
     * Subscribe to the counts for this query
     *
     * @param callback
     * @returns {}
     */
    subscribeCount(callback) {
        this._countSubscriptionToken = new ReactiveVar(null);

        Meteor.call(this.name + '.count.subscribe', this.params, (error, token) => {
            if (!this._countSubscriptionRemovalFlag) {
                this._countSubscriptionToken.set(token);
                this.countSubscriptionHandle = Meteor.subscribe(this.name + '.count', token, callback);
            }

            this._countSubscriptionRemovalFlag = false;
        });

        // Return a 'fake' subscription handle to the caller
        const handle = {
            ready: () => this._countSubscriptionToken.get() !== null && this.countSubscriptionHandle.ready(),
            stop: this.unsubscribeCount,
        };

        return handle;
    }

    unsubscribeCount() {
        if (this.countSubscriptionHandle) {
            this.countSubscriptionHandle.stop();
        } else {
            // If we hit this branch, then Meteor.call in subscribeCount hasn't finished yet
            // so set a flag to stop the subscription from being created
            this._countSubscriptionRemovalFlag = true;
        }

        this._countSubscriptionToken = null;
        this.countSubscriptionHandle = null;
    }

    /**
     *
     */
    fetchCount() {
        if (!this._countSubscriptionToken) {
            throw new Meteor.Error('not-allowed', 'You are on client, so you must subscribe to the counts before fetching them.');
        }

        const id = this._countSubscriptionToken.get();
        if (id === null) return null;

        const doc = Counts.findOne(id);
        return doc.count;
    }

    /**
     * Unsubscribe if an existing subscription exists
     */
    unsubscribe() {
        if (this.subscriptionHandle) {
            this.subscriptionHandle.stop();
        }

        this.subscriptionHandle = null;
    }

    /**
     * Fetches elements in sync using promises
     * @return {*}
     */
    async fetchSync() {
        if (this.subscriptionHandle) {
            throw new Meteor.Error('This query is reactive, meaning you cannot use promises to fetch the data.');
        }

        return await callWithPromise(this.name, prepareForProcess(this.body, this.params));
    }

    /**
     * Fetches one element in sync
     * @return {*}
     */
    async fetchOneSync() {
        return _.first(await this.fetchSync())
    }

    /**
     * Retrieves the data.
     * @param callbackOrOptions
     * @returns {*}
     */
    fetch(callbackOrOptions) {
        if (!this.subscriptionHandle) {
            return this._fetchStatic(callbackOrOptions)
        } else {
            return this._fetchReactive(callbackOrOptions);
        }
    }

    /**
     * @param args
     * @returns {*}
     */
    fetchOne(...args) {
        if (!this.subscriptionHandle) {
            const callback = args[0];
            if (!_.isFunction(callback)) {
                throw new Meteor.Error('You did not provide a valid callback');
            }

            this.fetch((err, res) => {
                callback(err, res ? _.first(res) : null);
            })
        } else {
            return _.first(this.fetch(...args));
        }
    }

    /**
     * Gets the count of matching elements in sync.
     * @returns {any}
     */
    async getCountSync() {
        return await callWithPromise(this.name + '.count', prepareForProcess(this.body, this.params));
    }

    /**
     * Gets the count of matching elements.
     * @param callback
     * @returns {any}
     */
    getCount(callback) {
        if (!callback) {
            throw new Meteor.Error('not-allowed', 'You are on client so you must either provide a callback to get the count.');
        }

        return Meteor.call(this.name + '.count', this.params, callback);
    }

    /**
     * Fetching non-reactive queries
     * @param callback
     * @private
     */
    _fetchStatic(callback) {
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
    _fetchReactive(options = {}) {
        let body = prepareForProcess(this.body, this.params);
        if (!options.allowSkip && body.$options && body.$options.skip) {
            delete body.$options.skip;
        }

        return recursiveFetch(
            createGraph(this.collection, body)
        );
    }
}
