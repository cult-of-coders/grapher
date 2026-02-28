import prepareForProcess from '../query/lib/prepareForProcess.js';
import Base from './namedQuery.base';
import deepClone from 'lodash.clonedeep';
import MemoryResultCacher from './cache/MemoryResultCacher';
import intersectDeep from '../query/lib/intersectDeep';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';

/**
 * @template T
 * @template {Grapher.Params} P Params type
 * @extends Base<T, P>
 */
export default class extends Base {
  /**
   * Retrieves the data.
   *
   * @param {Grapher.QueryFetchContext<T>} [context]
   * @returns {*}
   */
  fetch(context) {
    throw new Error('fetch is not available on server, please use fetchAsync');
  }

  /**
   *
   * @param {Grapher.QueryFetchContext<T>} [context]
   */
  async fetchAsync(context) {
    await this._performSecurityChecks(context, this.params);

    if (this.isResolver) {
      return this._fetchResolverData(context);
    } else {
      let body = deepClone(this.body);
      if (this.params.$body) {
        body = intersectDeep(body, this.params.$body);
      }

      // we must apply emobdyment here
      this.doEmbodimentIfItApplies(body, this.params);

      const query = this.collection.createQuery(deepClone(body), {
        params: deepClone(this.params),
      });

      if (this.cacher) {
        const cacheId = this.cacher.generateQueryId(
          this.queryName,
          this.params,
        );
        return this.cacher.fetchAsync(cacheId, { query });
      }

      return query.fetchAsync();
    }
  }

  /**
   * @param {Grapher.QueryFetchContext<T>} [context]
   * @returns {*}
   * @deprecated
   * @see fetchOneAsync
   */
  fetchOne(context) {
    throw new Error('fetchOne is not available on server, please use fetchOneAsync');
  }

  /**
   * Fetches one element in async
   * @param {Grapher.QueryFetchContext<T>} [context]
   * @returns {Promise<T | undefined>}
   */
  async fetchOneAsync(context) {
    return _.first(await this.fetchAsync(context));
  }



  /**
   * Gets the count of matching elements.
   *
   * @returns {any}
   */
  getCount(context) {
    throw new Error('count is not available on server, please use countAsync');
  }

  /**
   * Gets the count of matching elements.
   *
   * @param {Grapher.QueryFetchContext<T>} [context]
   * @returns {Promise<number>}
   */
  async getCountAsync(context) {
    await this._performSecurityChecks(context, this.params);

    const countCursor = await this.getCursorForCounting();

    if (this.cacher) {
      const cacheId =
        'count::' + this.cacher.generateQueryId(this.queryName, this.params);

      return this.cacher.fetchAsync(cacheId, { countCursor });
    }

    return countCursor.countAsync();
  }

  /**
   * Returns the cursor for counting
   * This is most likely used for counts cursor
   */
  async getCursorForCounting() {
    let body = deepClone(this.body);
    this.doEmbodimentIfItApplies(body, this.params);
    body = await prepareForProcess(body, this.params);

    return this.collection.find(body.$filters || {}, { fields: { _id: 1 } });
  }

  /**
   * @param cacher
   */
  cacheResults(cacher) {
    if (!cacher) {
      cacher = new MemoryResultCacher();
    }

    this.cacher = cacher;
  }

  /**
   * Configure resolve. This doesn't actually call the resolver, it just sets it
   * @param fn
   */
  resolve(fn) {
    if (!this.isResolver) {
      throw new Meteor.Error(
        'invalid-call',
        `You cannot use resolve() on a non resolver NamedQuery`,
      );
    }

    this.resolver = fn;
  }

  /**
   * @returns {*}
   * @private
   */
  _fetchResolverData(context) {
    const resolver = this.resolver;
    const self = this;
    const query = {
      fetch() {
        return resolver.call(context, self.params);
      },
    };

    if (this.cacher) {
      const cacheId = this.cacher.generateQueryId(this.queryName, this.params);
      return this.cacher.fetch(cacheId, { query });
    }

    return query.fetch();
  }

  /**
   * @param {Grapher.QueryFetchContext<T>} [context] Meteor method/publish context
   * @param {P} [params]
   *
   * @returns {Promise<void>}
   *
   * @private
   */
  async _performSecurityChecks(context, params) {
    if (context && this.exposeConfig) {
      await this._callFirewall(context, context.userId, params);
    }

    await this.doValidateParams(params);
  }
}
