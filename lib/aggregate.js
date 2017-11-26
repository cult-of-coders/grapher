Mongo.Collection.prototype.aggregate = function(pipelines, options) {
    const coll = this.rawCollection();

    return Meteor.wrapAsync(coll.aggregate, coll)(pipelines, options);
};
