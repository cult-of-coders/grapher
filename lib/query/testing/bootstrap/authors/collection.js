import AuthorSchema from './schema.js';

const Authors = new Mongo.Collection('authors');
export default Authors;

Authors.attachSchema(AuthorSchema);