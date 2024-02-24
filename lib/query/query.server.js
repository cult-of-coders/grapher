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
    const node = createGraph(
      this.collection,
      prepareForProcess(this.body, this.params),
    );

    return hypernova(node, context.userId, { params: this.params });
  }

  /**
   *
   * @param {Grapher.QueryFetchContext<T>} [context]
   */
  fetchAsync(context = {}) {
    const node = createGraph(
      this.collection,
      prepareForProcess(this.body, this.params),
    );

    return hypernova(node, context.userId, { params: this.params });
  }

  /**
   * @param {Grapher.QueryFetchContext<T>} [context]
   * @returns {*}
   */
  fetchOne(context = {}) {
    context.$options = context.$options || {};
    context.$options.limit = 1;
    return _.first(this.fetch(context));
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
    return this.collection.find(this.body.$filters || {}, {}).count();
  }
}
