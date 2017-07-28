import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { COUNTS_COLLECTION_CLIENT } from './constants';

// XXX: Should this persist between server restarts?
const collection = new Mongo.Collection(null);

/**
 * This method generates a reactive count endpoint (a method and publication) for a collection or named query.
 *
 * @param {String} name - Name of the query or collection
 * @param {Function} getCursor - Takes in the user's session document as an argument, and turns that into a Mongo cursor.
 * @param {Function} getSession - Takes the subscribe method's argument as its parameter. Should enforce any necessary security constraints. The return value of this function is stored in the session document.
 */
export default (name, { getCursor, getSession }) => {
    Meteor.methods({
        [name + '.count.subscribe'](paramsOrBody) {
            const session = getSession.call(this, paramsOrBody);
            const existingSession = collection.findOne({ ...session, userId: this.userId });

            // Try to reuse sessions if the user subscribes multiple times with the same data
            if (existingSession) {
                return existingSession._id;
            }

            const token = collection.insert({
                ...session,
                query: name,
                userId: this.userId,
            });

            return token;
        },
    });

    Meteor.publish(name + '.count', function(token) {
        check(token, String);
        const self = this;
        const request = collection.findOne({ _id: token, userId: self.userId });

        if (!request) {
            throw new Error('no-request', `You must acquire a request token via the "${name}.count.subscribe" method first.`);
        }

        const cursor = getCursor(request);

        // Start counting
        let count = 0;
        self.added(COUNTS_COLLECTION_CLIENT, token, { count });
        const handle = cursor.observeChanges({
            added(id) {
                count++;
                self.changed(COUNTS_COLLECTION_CLIENT, token, { count });
            },

            removed(id) {
                count--;
                self.changed(COUNTS_COLLECTION_CLIENT, token, { count });
            },
        });

        self.onStop(() => {
            handle.stop();
            collection.remove(token);
        });
        self.ready();
    });
};
