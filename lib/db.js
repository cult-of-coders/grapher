import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const db = new Proxy(
  {},
  {
    get: function(obj, prop) {
      const collection = Mongo.Collection.get(prop);

      if (!collection) {
        Meteor.isDevelopment &&
          console.warn(`There is no collection with the name: "${prop}"`);
      }

      return collection;
    },
  }
);

export default db;
