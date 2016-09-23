import CommentSchema from './schema.js';

const Comments = new Mongo.Collection('comments');
export default Comments;

Comments.attachSchema(CommentSchema);