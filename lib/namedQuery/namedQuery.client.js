import CountSubscription from '../query/counts/countSubscription';
import createGraph from '../query/lib/createGraph.js';
import recursiveFetch from '../query/lib/recursiveFetch.js';
import prepareForProcess, { applyPagination } from '../query/lib/prepareForProcess.js';
import { _ } from 'meteor/underscore';
import Base from './namedQuery.base';
import intersectDeep from '../query/lib/intersectDeep';
import { Tracker } from 'meteor/tracker';

/**
 * @template T
 * @template {Grapher.Params} P Params type
 * @extends Base<T, P>
 */
export default class extends Base {

  /**
   * Subscribe
   *
   * @param {Grapher.MeteorSubscribeCallbacks} callback
   * @returns {Meteor.SubscriptionHandle}
   */
  subscribe(callback) {
    if (this.isResolver) {
      throw new Meteor.Error(
        'not-allowed',
        `You cannot subscribe to a resolver query`,
      );
    }

    const subscriptionHandle = Meteor.subscribe(
      this.name,
      this.params,
      callback,
    );

    this.subscriptionHandle = subscriptionHandle;

    return subscriptionHandle;
  }

  /**
   * Subscribe to the counts for this query
   *
   * @param {Grapher.MeteorSubscribeCallbacks} callback
   * @returns {Object}
   */
  subscribeCount(callback) {
    if (this.isResolver) {
      throw new Meteor.Error(
        'not-allowed',
        `You cannot subscribe to a resolver query`,
      );
    }

    if (!this._counter) {
      this._counter = new CountSubscription(this);
    }

    return this._counter.subscribe(this.params, callback);
  }

  /**
   * Unsubscribe if an existing subscription exists
   */
  unsubscribe() {
    if (this.subscriptionHandle) {
      this.subscriptionHandle.stop();
    }

    this.subscriptionHandle = null;
  }

  /**
   * Unsubscribe to the counts if a subscription exists.
   */
  unsubscribeCount() {
    if (this._counter) {
      this._counter.unsubscribe();
      this._counter = null;
    }
  }

  /**
   * @deprecated
   * @return {Promise<unknown>}
   */
  async fetchSync() {
    return this.fetchAsync();
  }

  /**
   * @deprecated
   *
   * @returns Promise<unknown>
   */
  fetchOneSync() {
    return this.fetchOneAsync();
  }

  /**
   * Fetches one element in sync
   * @return {Promise<unknown>}
   */
  async fetchOneAsync() {
    return _.first(await this.fetchAsync());
  }

  // /**
  //  * Retrieves the data.
  //  * @returns {*}
  //  */
  // fetch() {
  //   if (!this.subscriptionHandle) {
  //     throw new Error(
  //       'Please use fetchAsync instead of fetch outside of subscription',
  //     );
  //   } else {
  //       // Use cache instead of async _fetchReactive
  //       return this.cache[this.subscriptionHandle.subscriptionId];
  //       // return this._fetchReactive(callbackOrOptions);
  //   }
  // }

  /**
   * Retrieves the data asynchronously to support async reducers.
   */
  async fetchReactiveAsync(computation) {
    if (!this.subscriptionHandle) {
      throw new Error(
        'Please use fetchAsync instead of fetch outside of subscription',
      );
    }
    return await this._fetchReactive({}, computation);
  }

  fetchAsync() {
    if (this.subscriptionHandle) {
      throw new Meteor.Error(
        'This query is reactive, meaning you cannot use promises to fetch the data.',
      );
    }
    return this._fetchStatic();
  }

  /**
   * @param args
   * @returns {*}
   */
  fetchOne(...args) {
    if (!this.subscriptionHandle) {
      const callback = args[0];
      if (!_.isFunction(callback)) {
        throw new Meteor.Error('You did not provide a valid callback');
      }

      this.fetch((err, res) => {
        callback(err, res ? _.first(res) : null);
      });
    } else {
      return _.first(this.fetch(...args));
    }
  }

  /**
   * @deprecated Use getCountAsync
   */
  async getCountSync() {
    return this.getCountAsync();
  }

  /**
   * Gets the count of matching elements.
   * @returns {any}
   */
  getCount() {
    if (this._counter) {
      return this._counter.getCount();
    } else {
      throw new Error(
        'Please use getCountAsync instead of getCount for static queries',
      );
      //   if (!callback) {
      //     throw new Meteor.Error(
      //       'not-allowed',
      //       'You are on client so you must either provide a callback to get the count or subscribe first.',
      //     );
      //   } else {
      //     return Meteor.call(this.name + '.count', this.params, callback);
      //   }
    }
  }

  /**
   * Gets the count of matching elements in sync.
   * @returns {Promise<number>}
   */
  getCountAsync() {
    if (this._counter) {
      throw new Meteor.Error(
        'This query is reactive, meaning you cannot use promises to fetch the data.',
      );
    }
    return Meteor.callAsync(this.name + '.count', this.params);
  }

  /**
   * Fetching non-reactive queries
   * @private
   */
  _fetchStatic() {
    return Meteor.callAsync(this.name, this.params);
  }

  /**
   * Fetching when we've got an active publication
   *
   * @param options
   * @returns {*}
   * @private
   */
  async _fetchReactive(options = {}, computation) {
    let body = this.body;
    if (this.params.$body) {
      body = intersectDeep(body, this.params.$body);
    }

    body = await prepareForProcess(body, this.params);
    // body.$options = Object.assign({}, body.$options, this.params.options);
    // body.$filters = Object.assign({}, body.$filters, this.params.filters);
    // applyPagination(body, this.params);
    if (!options.allowSkip && body.$options && body.$options.skip) {
      delete body.$options.skip;
    }

    return await Tracker.withComputation(computation, () => recursiveFetch(createGraph(this.collection, body), undefined, {
      scoped: this.options.scoped,
      subscriptionHandle: this.subscriptionHandle,
    }));
  }
}
