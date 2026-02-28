import { Mongo } from 'meteor/mongo';

const Items = new Mongo.Collection('security_items');
const SubItems = new Mongo.Collection('security_subitems');

export { Items, SubItems };

if (Meteor.isServer) {
  Items.expose({
    firewall(filters, options, userId) {},
  });

  SubItems.expose({
    firewall(filters, options, userId) {
      filters._id = false;
    },
  });
}
