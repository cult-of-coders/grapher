import Exposure from './exposure.js';

Object.assign(Mongo.Collection.prototype, {
  /**
   * @this {Mongo.Collection<unknown>}
   * @param {Grapher.ExposureConfig} config
   */
  expose(config) {
    if (!Meteor.isServer) {
      throw new Meteor.Error(
        'not-allowed',
        `You can only expose a collection server side. ${this._name}`,
      );
    }

    new Exposure(this, config);
  },
});
