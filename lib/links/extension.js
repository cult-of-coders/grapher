import { LINK_STORAGE } from './constants.js';
import Linker from './linker.js';
import { _ } from 'meteor/underscore';

Object.assign(Mongo.Collection.prototype, {
  /**
   * The data we add should be valid for config.schema.js
   *
   * @this {Mongo.Collection<unknown>}
   * @param {Object.<string, Grapher.LinkConfig>} data
   *
   */
  addLinks(data) {
    if (!this[LINK_STORAGE]) {
      this[LINK_STORAGE] = {};
    }

    _.each(data, (linkConfig, linkName) => {
      if (this[LINK_STORAGE][linkName]) {
        throw new Meteor.Error(
          `You cannot add the link with name: ${linkName} because it was already added to ${this._name} collection`,
        );
      }

      const linker = new Linker(this, linkName, linkConfig);

      _.extend(this[LINK_STORAGE], {
        [linkName]: linker,
      });
    });
  },

  /**
   * @this {Mongo.Collection<unknown>}
   * @returns
   */
  getLinks() {
    return this[LINK_STORAGE];
  },

  /**
   * @this {Mongo.Collection<unknown>}
   * @param {string} name
   * @returns
   */
  getLinker(name) {
    if (this[LINK_STORAGE]) {
      return this[LINK_STORAGE][name];
    }
  },

  /**
   * @this {Mongo.Collection<unknown>}
   * @param {string} name
   * @returns {boolean}
   */
  hasLink(name) {
    if (!this[LINK_STORAGE]) {
      return false;
    }

    return !!this[LINK_STORAGE][name];
  },

  /**
   *
   * @this {Mongo.Collection<unknown>}
   * @param {unknown} objectOrId
   * @param {string} name
   * @returns
   */
  async getLink(objectOrId, name) {
    let linkData = this[LINK_STORAGE];

    if (!linkData) {
      throw new Meteor.Error(
        `There are no links defined for collection: ${this._name}`,
      );
    }

    if (!linkData[name]) {
      throw new Meteor.Error(
        `There is no link ${name} for collection: ${this._name}`,
      );
    }

    const linker = linkData[name];
    let object = objectOrId;
    if (typeof objectOrId == 'string') {
      if (!linker.isVirtual()) {
        object = await this.findOneAsync(objectOrId, {
          fields: {
            [linker.linkStorageField]: 1,
          },
        });
      } else {
        object = { _id: objectOrId };
      }

      if (!object) {
        throw new Meteor.Error(
          `We could not find any object with _id: "${objectOrId}" within the collection: ${this._name}`,
        );
      }
    }

    return linkData[name].createLink(object);
  },
});
