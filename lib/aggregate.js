import { Promise } from 'meteor/promise';

Mongo.Collection.prototype.aggregate = function(pipelines, options = {}) {
    const coll = this.rawCollection();

    let result = Meteor.wrapAsync(coll.aggregate, coll)(pipelines, options);

    // We need to check If it's an AggregationCursor
    // The reason we do this was because of the upgrade to 1.7 which involved a mongodb driver update
    if (Array.isArray(result)) {
        return result;
    } else {
        return Promise.await(result.toArray());
    }
};
