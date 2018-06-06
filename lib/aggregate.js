import { Promise } from 'meteor/promise';

Mongo.Collection.prototype.aggregate = function(pipelines, options = {}) {
    const coll = this.rawCollection();

    let result = Meteor.wrapAsync(coll.aggregate, coll)(pipelines, options);

    if (typeof result === 'object') {
        return Promise.await(result.toArray());
    }

    return result;
};
