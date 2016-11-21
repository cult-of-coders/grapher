const storage = '__reducers';

_.extend(Mongo.Collection.prototype, {
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
                throw new Meteor.Error(`You cannot add the reducer with name: ${reducerName} because it is already defined as a link in ${this._name} collection`)
            }

            if (this[reducerConfig][reducerName]) {
                throw new Meteor.Error(`You cannot add the reducer with name: ${reducerName} because it was already added to ${this._name} collection`)
            }

            _.extend(this[storage], {
                [reducerName]: reducerConfig
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
    }
});