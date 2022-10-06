import { Meteor } from 'meteor/meteor';
import { Mongo, MongoInternals } from 'meteor/mongo';

if (!Mongo.Collection.prototype.aggregate) {
    Mongo.Collection.prototype.aggregate = function (pipelines, options) {
        const Collection = this.rawCollection();

        if (MongoInternals.NpmModules.mongodb.version[0] === '3') {
            const cursor = Meteor.wrapAsync(Collection.aggregate, Collection)(pipelines, options);
            return Meteor.wrapAsync(cursor.toArray, cursor)();
        } else if (MongoInternals.NpmModules.mongodb.version[0] === '4') {
            const cursor = Collection.aggregate(pipelines, options);
            return Meteor.wrapAsync(cursor.toArray, cursor)();
        }

        return Meteor.wrapAsync(Collection.aggregate.bind(Collection))(pipelines, options);
    };
}
