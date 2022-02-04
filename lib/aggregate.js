import { Promise } from 'meteor/promise';

Mongo.Collection.prototype.aggregate = function(pipelines, options = {}) {
    return Promise.await(this.rawCollection().aggregate(pipelines, options).toArray());
};
