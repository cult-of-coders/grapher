import { check, Match } from 'meteor/check';
import addFieldMap from './lib/addFieldMap';
import addExpanders from './lib/addExpanders';

const STORAGE_KEY = '__reducers';
Object.assign(Mongo.Collection.prototype, {
    /**
     * @param data
     */
    addReducers(data) {
        if (!this[STORAGE_KEY]) {
            this[STORAGE_KEY] = {};
        }

        _.each(data, (reducerConfig, reducerName) => {
            if (this.getLinker(reducerName)) {
                throw new Meteor.Error(
                    `You cannot add the reducer with name: ${reducerName} because it is already defined as a link in ${
                        this._name
                    } collection`
                );
            }

            if (this[STORAGE_KEY][reducerName]) {
                throw new Meteor.Error(
                    `You cannot add the reducer with name: ${reducerName} because it was already added to ${
                        this._name
                    } collection`
                );
            }

            check(reducerConfig, {
                body: Object,
                reduce: Match.Maybe(Function),
                expand: Match.Maybe(Boolean),
            });

            _.extend(this[STORAGE_KEY], {
                [reducerName]: reducerConfig,
            });
        });
    },

    /**
     * @param name
     * @returns {*}
     */
    getReducer(name) {
        if (this[STORAGE_KEY]) {
            return this[STORAGE_KEY][name];
        }
    },

    /**
     * This creates reducers that makes sort of aliases for the database fields we use
     */
    addFieldMap,
    addExpanders,
});
