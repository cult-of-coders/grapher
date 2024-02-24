import { _ } from 'meteor/underscore';

/**
 * When you work with add/remove set/unset
 * You have the ability to pass strings, array of strings, objects, array of objects
 * If you are adding something and you want to save them in db, you can pass objects without ids.
 */
export default new (class {
  /**
   * Extracts the ids of object(s) or strings and returns an array.
   * @param {Grapher.IdOption} what
   * @param {Grapher.SmartArgumentsOptions} [options]
   * @returns {Promise<string[]>}
   */
  async getIds(what, options) {
    if (Array.isArray(what)) {
      /* @type {string[]} */
      const ids = [];
      for await (const subWhat of what) {
        const id = await this.getId(subWhat, options);
        if (id) {
          ids.push(id);
        }
      }
      return ids;
    } else {
      const id = await this.getId(what, options);
      return id ? [id] : [];
    }
  }

  /**
   *
   * @param {Grapher.IdSingleOption} what
   * @param {Grapher.SmartArgumentsOptions} [options]
   * @returns {Promise<string | undefined>}
   */
  async getId(what, options = {}) {
    if (typeof what === 'string') {
      return what;
    }

    if (_.isObject(what)) {
      if (!what._id && options.saveToDatabase) {
        what._id = await options.collection.insertAsync(what);
      }

      return what._id;
    }
  }
})();
