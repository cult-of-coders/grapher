import { check } from 'meteor/check';
import addFieldMap from './lib/addFieldMap';

const storage = '__reducers';
Object.assign(Mongo.Collection.prototype, {
    /**
     * @param data
     */
    addReducers(data) {
        if (!this[storage]) {
            this[storage] = {};
        }

        _.each(data, (reducerConfig, reducerName) => {
            if (!this[reducerConfig]) {
                this[reducerConfig] = {};
            }

            if (this.getLinker(reducerName)) {
                throw new Meteor.Error(
                    `You cannot add the reducer with name: ${reducerName} because it is already defined as a link in ${
                        this._name
                    } collection`
                );
            }

            if (this[reducerConfig][reducerName]) {
                throw new Meteor.Error(
                    `You cannot add the reducer with name: ${reducerName} because it was already added to ${
                        this._name
                    } collection`
                );
            }

            check(reducerConfig, {
                body: Object,
                reduce: Function,
            });

            _.extend(this[storage], {
                [reducerName]: reducerConfig,
            });
        });
    },

    /**
     * @param name
     * @returns {*}
     */
    getReducer(name) {
        if (this[storage]) {
            return this[storage][name];
        }
    },

    /**
     * This creates reducers that makes sort of aliases for the database fields we use
     */
    addFieldMap,
});
