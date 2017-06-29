import { Mongo } from 'meteor/mongo';
import { fragmentStorage } from './symbols';
import Fragment from './fragment';

_.extend(Mongo.Collection.prototype, {
    addFragments(data) {
        if (!this[fragmentStorage]) {
            this[fragmentStorage] = {};
        }

        _.each(data, (definition, fragmentName) => {
            if (this[fragmentStorage][fragmentName]) {
                throw new Meteor.Error(`You cannot add the fragment with name: ${fragmentName} because it was already added to ${this._name} collection`);
            }

            const fragment = new Fragment(this, fragmentName, definition);
            _.extend(this[fragmentStorage], {
                [fragmentName]: fragment,
            });
        });
    },

    getFragments() {
        return this[fragmentStorage];
    },

    getFragment(name) {
        if (this[fragmentStorage]) {
            return this[fragmentStorage][name];
        }
    },
});
