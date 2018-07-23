import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const db = new Proxy(
  {},
  {
    get: function(obj, prop) {
      if (typeof prop === 'symbol') {
        return obj[prop];
      }

      const collection = Mongo.Collection.get(prop);

      if (!collection) {
        return obj[prop];
      }

      return collection;
    },
  }
);

export default db;
