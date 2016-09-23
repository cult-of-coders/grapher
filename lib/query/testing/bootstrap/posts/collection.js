import PostSchema from './schema.js';

const Posts = new Mongo.Collection('posts');
export default Posts;

Posts.attachSchema(PostSchema);
