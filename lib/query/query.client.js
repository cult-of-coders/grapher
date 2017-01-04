import { _ } from 'meteor/underscore';
import createGraph from './lib/createGraph.js';
import recursiveFetch from './lib/recursiveFetch.js';
import prepareForProcess from './lib/prepareForProcess.js';
import callWithPromise from './lib/callWithPromise';
import Base from './query.base';

export default class Query extends Base {
    /**
     * Subscribe
     *
     * @param callback {Function} optional
     * @returns {null|any|*}
     */
    subscribe(callback) {
        this.subscriptionHandle = Meteor.subscribe(
            this.name,
            prepareForProcess(this.body, this.params),
            callback
        );

        return this.subscriptionHandle;
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

        return Meteor.call(this.name + '.count', prepareForProcess(this.body, this.params), callback);
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

        Meteor.call(this.name, prepareForProcess(this.body, this.params), callback);
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
