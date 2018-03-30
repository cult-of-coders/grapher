import { Mongo } from 'meteor/mongo';

const db = new Proxy(
  {},
  {
    get: function(obj, prop) {
      const collection = Mongo.Collection.get(prop);

      if (!collection) {
        throw new Meteor.Error(
          'collection-not-found',
          `There is no collection with name ${prop}`
        );
      }

      return collection;
    },
  }
);

export default db;
