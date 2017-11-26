import { Mongo } from 'meteor/mongo';

const PostsCollection = new Mongo.Collection('counts_posts');

export default PostsCollection;
