import { Mongo } from 'meteor/mongo';
import { linkStorage } from './symbols.js';
import Linker from './linker.js';

_.extend(Mongo.Collection.prototype, {
    /**
     * The data we add should be valid for config.schema.js
     */
    addLinks(data) {
        if (!this[linkStorage]) {
            this[linkStorage] = {};
        }

        _.each(data, (linkConfig, linkName) => {
            if (this[linkStorage][linkName]) {
                throw new Meteor.Error(`You cannot add the link with name: ${linkName} because it was already added to ${this._name} collection`)
            }

            const linker = new Linker(this, linkName, linkConfig);

            _.extend(this[linkStorage], {
                [linkName]: linker
            });
        });
    },

    getLinker(name) {
        if (this[linkStorage]) {
            return this[linkStorage][name];
        }
    },

    getLink(objectOrId, name) {
        let linkData = this[linkStorage];

        if (!linkData[name]) {
            throw new Meteor.Error(`There is no link ${name} for collection ${this._name}`);
        }

        let object = objectOrId;
        if (typeof(objectOrId) == 'string') {
            object = this.findOne(objectOrId);
        }

        return linkData[name].createLink(object);
    }
});

