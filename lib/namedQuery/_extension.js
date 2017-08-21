import createQuery from '../query/createQuery.js';

_.extend(Mongo.Collection.prototype, {
    createNamedQuery(...args) {
      console.warn('createNamedQuery is deprecated. Functionality has been moved over to createQuery');
      return this.createQuery(...args);
    }
});
