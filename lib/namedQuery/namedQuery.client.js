import CountSubscription from '../query/counts/countSubscription';
import createGraph from '../query/lib/createGraph.js';
import recursiveFetch from '../query/lib/recursiveFetch.js';
import prepareForProcess from '../query/lib/prepareForProcess.js';
import {_} from 'meteor/underscore';
import callWithPromise from '../query/lib/callWithPromise';
import Base from './namedQuery.base';
import {LocalCollection} from 'meteor/minimongo';
import intersectDeep from '../query/lib/intersectDeep';

export default class extends Base {
    /**
     * Subscribe
     *
     * @param callback
     * @returns {null|any|*}
     */
    subscribe(callback) {
        if (this.isResolver) {
            throw new Meteor.Error('not-allowed', `You cannot subscribe to a resolver query`);
        }

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
     * @returns {Object}
     */
    subscribeCount(callback) {
        if (this.isResolver) {
            throw new Meteor.Error('not-allowed', `You cannot subscribe to a resolver query`);
        }

        if (!this._counter) {
            this._counter = new CountSubscription(this);
        }

        return this._counter.subscribe(this.params, callback);
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
     * Unsubscribe to the counts if a subscription exists.
     */
    unsubscribeCount() {
        if (this._counter) {
            this._counter.unsubscribe();
            this._counter = null;
        }
    }

    /**
     * Fetches elements in sync using promises
     * @return {*}
     */
    async fetchSync() {
        if (this.subscriptionHandle) {
            throw new Meteor.Error('This query is reactive, meaning you cannot use promises to fetch the data.');
        }

        return await callWithPromise(this.name, this.params);
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
        if (this._counter) {
            throw new Meteor.Error('This query is reactive, meaning you cannot use promises to fetch the data.');
        }

        return await callWithPromise(this.name + '.count', this.params);
    }

    /**
     * Gets the count of matching elements.
     * @param callback
     * @returns {any}
     */
    getCount(callback) {
        if (this._counter) {
            return this._counter.getCount();
        } else {
            if (!callback) {
                throw new Meteor.Error('not-allowed', 'You are on client so you must either provide a callback to get the count or subscribe first.');
            } else {
                return Meteor.call(this.name + '.count', this.params, callback);
            }
        }
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
        let body = this.body;
        if (this.params.$body) {
            body = intersectDeep(body, this.params.$body);
        }

        body = prepareForProcess(body, this.params);
        if (!options.allowSkip && body.$options && body.$options.skip) {
            delete body.$options.skip;
        }

        return recursiveFetch(
            createGraph(this.collection, body),
            undefined, {
                scoped: this.options.scoped,
                subscriptionHandle: this.subscriptionHandle
            });
    }
}
