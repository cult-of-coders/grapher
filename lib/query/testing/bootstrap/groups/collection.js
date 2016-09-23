import GroupSchema from './schema.js';

const Groups = new Mongo.Collection('groups');
export default Groups;

Groups.attachSchema(GroupSchema);