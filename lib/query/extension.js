import Query from './query.js';

_.extend(Mongo.Collection.prototype, {
    createQuery(body, params = {}) {
        return new Query(this, body, params);
    }
});