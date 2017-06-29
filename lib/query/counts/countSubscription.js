import Counts from './collection';
import createFauxSubscription from './createFauxSubscription';
import prepareForProcess from '../lib/prepareForProcess.js';
import NamedQueryBase from '../../namedQuery/namedQuery.base';
import { ReactiveVar } from 'meteor/reactive-var';

export default class CountSubscription {
    /**
     * @param {*} query - The query to use when fetching counts
     */
    constructor(query) {
        this.accessToken = new ReactiveVar(null);
        this.query = query;
    }

    /**
     * Starts a subscription request for reactive counts.
     *
     * @param {*} arg - The argument to pass to {name}.count.subscribe
     * @param {*} callback
     */
    subscribe(arg, callback) {
        this.accessToken.set(null);

        Meteor.call(this.query.name + '.count.subscribe', arg, (error, token) => {
            if (!this._markedForUnsubscribe) {
                this.subscriptionHandle = Meteor.subscribe(this.query.name + '.count', token, callback);
                this.accessToken.set(token);
            }

            this._markedForUnsubscribe = false;
        });

        return createFauxSubscription(this);
    }

    /**
     * Unsubscribes from the count endpoint, if there is such a subscription.
     */
    unsubscribe() {
        if (this.subscriptionHandle) {
            this.subscriptionHandle.stop();
        } else {
            // If we hit this branch, then Meteor.call in subscribe hasn't finished yet
            // so set a flag to stop the subscription from being created
            this._markedForUnsubscribe = true;
        }

        this.accessToken.set(null);
        this.subscriptionHandle = null;
    }

    /**
     * Reactively fetch current document count. Returns null if the subscription is not ready yet.
     *
     * @returns {Number|null} - Current document count
     */
    getCount() {
        const id = this.accessToken.get();
        if (id === null) return null;

        const doc = Counts.findOne(id);
        return doc.count;
    }

    /**
     * Returns whether or not a subscription request has been made.
     */
    isSubscribed() {
        return this.accessToken.get() !== null;
    }
}
