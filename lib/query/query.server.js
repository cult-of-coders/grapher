import createGraph from './lib/createGraph.js';
import prepareForProcess from './lib/prepareForProcess.js';
import hypernova from './hypernova/hypernova.js';
import Base from './query.base';
import { _ } from 'meteor/underscore';

/**
 * @template T
 * @template P=Grapher.Params Params type
 * @extends Base<T, P>
 */
export default class Query extends Base {
  /**
   * Retrieves the data.
   * @param {Grapher.QueryFetchContext<T>} context
   * @returns {*}
   */
  fetch(context = {}) {
    throw new Error(
      'You must call fetchAsync instead of fetch from server-side',
    );
  }

  /**
   *
   * @param {Grapher.QueryFetchContext<T>} [context]
   */
  async fetchAsync(context = {}) {
    const node = createGraph(
      this.collection,
      await prepareForProcess(this.body, this.params),
    );

    return hypernova(node, context.userId, { params: this.params });
  }

  /**
   * @param {Grapher.QueryFetchContext<T>} [context]
   * @returns {*}
   */
  fetchOne(context = {}) {
    throw new Error(
      'You must call fetchOneAsync instead of fetchOne from server-side',
    );
  }

  /**
   *
   * @param {Grapher.QueryFetchContext<T>} [context]
   * @returns {Promise<*>}
   */
  async fetchOneAsync(context = {}) {
    context.$options = context.$options || {};
    context.$options.limit = 1;
    const results = await this.fetchAsync(context);
    return _.first(results);
  }
  /**
   * Gets the count of matching elements.
   * @returns {number}
   */
  getCount() {
    throw new Error(
      'You must call countAsync instead of count from server-side',
    );
  }

  /**
   * Gets the count of matching elements.
   * @returns {Promise<number>}
   */
  getCountAsync() {
    return this.collection.find(this.body.$filters || {}, {}).countAsync();
  }
}
