import TagSchema from './schema.js';

const Tags = new Mongo.Collection('tags');
export default Tags;

Tags.attachSchema(TagSchema);