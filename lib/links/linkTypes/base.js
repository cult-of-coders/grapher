import SmartArgs from './lib/smartArguments.js';
import createSearchFilters from '../lib/createSearchFilters';
import Linker from '../linker.js';
import { _ } from 'meteor/underscore';

/**
 * @class
 * @property {Linker} linker
 * @property {string} linkStorageField
 * @property {Grapher.LinkObject} object
 */
export default class Link {
  get config() {
    return this.linker.linkConfig;
  }

  get isVirtual() {
    return this.linker.isVirtual();
  }

  /**
   * @param {Linker} linker
   * @param {Grapher.LinkObject} object
   * @param {Mongo.Collection<unknown> | null} collection
   */
  constructor(linker, object, collection) {
    this.linker = linker;
    this.object = object;

    /**
     * @private
     * @type {Mongo.Collection<unknown>}
     */
    this.linkedCollection = collection
      ? collection
      : linker.getLinkedCollection();

    if (this.linker.isVirtual()) {
      this.linkStorageField = this.config.relatedLinker.linkConfig.field;
    } else {
      this.linkStorageField = this.config.field;
    }
  }

  /**
   * Gets the stored link information value
   * @returns {*}
   */
  value() {
    if (this.isVirtual) {
      throw new Meteor.Error('You can only take the value from the main link.');
    }

    return this.object[this.linkStorageField];
  }

  /**
   * Finds linked data.
   *
   * @template T
   * @template [R=T]
   * @param {Grapher.DefaultFiltersWithMeta<T>} filters
   * @param {Mongo.Options<T> | undefined} options
   * @param {string | undefined} userId
   * @returns {Mongo.Cursor<T, R>}
   */
  find(filters = {}, options = {}, userId = undefined) {
    let linker = this.linker;
    /**
     * @type {Mongo.Collection<T, R>}
     */
    const linkedCollection = this.linkedCollection;

    let $metaFilters;
    if (filters.$meta) {
      $metaFilters = filters.$meta;
      delete filters.$meta;
    }

    const searchFilters = createSearchFilters(
      this.object,
      this.linker,
      $metaFilters,
    );

    /**
     * @type {Grapher.DefaultFiltersWithMeta<T>}
     */
    let appliedFilters = _.extend({}, filters, searchFilters);

    // console.log('search filters', searchFilters);

    // see https://github.com/cult-of-coders/grapher/issues/134
    // happens due to recursive importing of modules
    // TODO: find another way to do this
    if (linkedCollection.find) {
      return linkedCollection.find(appliedFilters, options, userId);
    } else {
      return linkedCollection.default.find(appliedFilters, options, userId);
    }
  }

  /**
   * @template T
   * @template [R=T]
   * @param {Mongo.Selector<T>} [filters]
   * @param {Mongo.Options<T>} [options]
   * @param {string} [userId]
   * @returns {Promise<R | R[] | undefined>}
   */
  async fetch(filters, options, userId) {
    /**
     * @type {R[]}
     */
    let result = await this.find(filters, options, userId).fetchAsync();

    if (this.linker.isOneResult()) {
      return _.first(result);
    }

    return result;
  }

  /**
   * This is just like fetch() but forces to get an array even if it's single result
   *
   * @template T
   * @template [R=T]
   * @param {Mongo.Selector<T>} [filters]
   * @param {Mongo.Options<T>} [options]
   * @param {string | undefined} [userId]
   * @returns {Promise<R[]>}
   */
  fetchAsArray(filters, options, userId) {
    return this.find(filters, options, userId).fetchAsync();
  }

  /**
   * When we are dealing with multiple type relationships, $in would require an array. If the field value is null, it will fail
   * We use clean to make it an empty array by default.
   */
  clean() {}

  /**
   * @param {Grapher.IdSingleOption} what
   * @param {boolean} [saveToDatabase]
   *
   * Extracts a single id
   */
  async identifyId(what, saveToDatabase) {
    return SmartArgs.getId(what, {
      saveToDatabase,
      collection: this.linkedCollection,
    });
  }

  /**
   *
   * @param {Grapher.IdOption} what
   * @param {boolean} [saveToDatabase]
   *
   * Extracts the ids of object(s) or strings and returns an array.
   */
  identifyIds(what, saveToDatabase) {
    return SmartArgs.getIds(what, {
      saveToDatabase,
      collection: this.linkedCollection,
    });
  }

  /**
   * Checks when linking data, if the ids are valid with the linked collection.
   * @throws Meteor.Error
   * @param {string[] | string} ids
   * @returns {Promise<void>}
   *
   * @protected
   */
  async _validateIds(ids) {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    // console.log('validate ids', ids);

    const foreignIdentityField = this.linker.foreignIdentityField;

    const validIds = await this.linkedCollection
      .find(
        {
          [foreignIdentityField]: { $in: ids },
        },
        { fields: { [foreignIdentityField]: 1 } },
      )
      .fetchAsync();

    const mappedIds = validIds.map((doc) => doc[foreignIdentityField]);

    if (mappedIds.length != ids.length) {
      throw new Meteor.Error(
        'not-found',
        `You tried to create links with non-existing id(s) inside "${
          this.linkedCollection._name
        }": ${_.difference(ids, validIds).join(', ')}`,
      );
    }
  }

  /**
   * @param {unknown} what
   */
  _checkWhat(what) {
    if (what === undefined || what === null) {
      throw new Error(`The argument passed: ${what} is not accepted.`);
    }
  }

  /**
   * This is for allowing commands such as set/unset/add/remove/metadata from the virtual link.
   *
   * @param {string} action
   * @param {Grapher.IdOption} [what]
   * @param {unknown} [metadata]
   *
   * @protected
   */
  async _virtualAction(action, what, metadata) {
    const linker = this.linker.linkConfig.relatedLinker;
    if (!linker) {
      throw new Error(
        `The virtual link does not have a relatedLinker. Name=${this.linker.linkName}`,
      );
    }

    // its an unset operation most likely.
    if (what === undefined) {
      const items = await this.fetch();
      const reversedLink = linker.createLink(items);
      await reversedLink.unset();

      return;
    }

    const arrayOfWhats = Array.isArray(what) ? what : [what];

    const docs = [];
    for await (const element of arrayOfWhats) {
      if (!_.isObject(element)) {
        const doc = await linker.mainCollection.findOneAsync(element);
        docs.push(doc);
      } else {
        if (!element._id) {
          const elementId = await linker.mainCollection.insertAsync(element);
          const doc = await linker.mainCollection.findOneAsync(elementId);
          _.extend(element, doc);
        }
        docs.push(element);
      }
    }

    // TODO(v3): promises
    // what = _.map(arrayOfWhats, (element) => {
    //   if (!_.isObject(element)) {
    //     return linker.mainCollection.findOneAsync(element);
    //   } else {
    //     if (!element._id) {
    //       const elementId = linker.mainCollection.insert(element);
    //       _.extend(element, linker.mainCollection.findOne(elementId));
    //     }

    //     return element;
    //   }
    // });

    const processedDocs = [];
    for await (const doc of docs) {
      const reversedLink = linker.createLink(doc);
      if (action == 'metadata') {
        if (linker.isSingle()) {
          const meta = await reversedLink.metadata(metadata);
          processedDocs.push(meta);
          return;
        } else {
          const meta = await reversedLink.metadata(this.object, metadata);
          processedDocs.push(meta);
          return;
        }
      } else if (action == 'add' || action == 'set') {
        if (linker.isSingle()) {
          await reversedLink.set(this.object, metadata);
        } else {
          await reversedLink.add(this.object, metadata);
        }
      } else {
        if (linker.isSingle()) {
          await reversedLink.unset();
        } else {
          await reversedLink.remove(this.object);
        }
      }

      processedDocs.push(undefined);
    }

    return processedDocs;

    // TODO(v3): promises
    // return _.map(what, (element) => {
    //   const reversedLink = linker.createLink(element);

    //   if (action == 'metadata') {
    //     if (linker.isSingle()) {
    //       return reversedLink.metadata(metadata);
    //     } else {
    //       return reversedLink.metadata(this.object, metadata);
    //     }
    //   } else if (action == 'add' || action == 'set') {
    //     if (linker.isSingle()) {
    //       reversedLink.set(this.object, metadata);
    //     } else {
    //       reversedLink.add(this.object, metadata);
    //     }
    //   } else {
    //     if (linker.isSingle()) {
    //       reversedLink.unset();
    //     } else {
    //       reversedLink.remove(this.object);
    //     }
    //   }
    // });
  }
}
