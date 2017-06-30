import { EJSON } from 'meteor/ejson';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import Counts from './collection';
import createFauxSubscription from './createFauxSubscription';
import prepareForProcess from '../lib/prepareForProcess.js';
import NamedQueryBase from '../../namedQuery/namedQuery.base';

export default class CountSubscription {
    /**
     * @param {*} query - The query to use when fetching counts
     */
    constructor(query) {
        this.accessToken = new ReactiveVar(null);
        this.fauxHandle = null;
        this.query = query;
    }

    /**
     * Starts a subscription request for reactive counts.
     *
     * @param {*} arg - The argument to pass to {name}.count.subscribe
     * @param {*} callback
     */
    subscribe(arg, callback) {
        // Don't try to resubscribe if arg hasn't changed
        if (EJSON.equals(this.lastArgs, arg) && this.fauxHandle) {
            return this.fauxHandle;
        }

        this.accessToken.set(null);
        this.lastArgs = arg;

        Meteor.call(this.query.name + '.count.subscribe', arg, (error, token) => {
            if (!this._markedForUnsubscribe) {
                this.subscriptionHandle = Meteor.subscribe(this.query.name + '.count', token, callback);
                this.accessToken.set(token);

                this.disconnectComputation = Tracker.autorun(() => this.handleDisconnect());
            }

            this._markedForUnsubscribe = false;
        });

        this.fauxHandle = createFauxSubscription(this);
        return this.fauxHandle;
    }

    /**
     * Unsubscribes from the count endpoint, if there is such a subscription.
     */
    unsubscribe() {
        if (this.subscriptionHandle) {
            this.disconnectComputation.stop();
            this.subscriptionHandle.stop();
        } else {
            // If we hit this branch, then Meteor.call in subscribe hasn't finished yet
            // so set a flag to stop the subscription from being created
            this._markedForUnsubscribe = true;
        }

        this.accessToken.set(null);
        this.fauxHandle = null;
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
     * All session info gets deleted when the server goes down, so when the client attempts to
     * optimistically resume the '.count' publication, the server will throw a 'no-request' error.
     *
     * This function prevents that by manually stopping and restarting the subscription when the
     * connection to the server is lost.
     */
    handleDisconnect() {
        const status = Meteor.status();
        if (!status.connected) {
            this._markedForResume = true;
            this.fauxHandle = null;
            this.subscriptionHandle.stop();
        }

        if (status.connected && this._markedForResume) {
            this._markedForResume = false;
            this.subscribe(this.lastArgs);
        }
    }

    /**
     * Returns whether or not a subscription request has been made.
     */
    isSubscribed() {
        return this.accessToken.get() !== null;
    }
}
