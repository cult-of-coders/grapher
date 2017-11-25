import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const PostsCollection = new Mongo.Collection('counts_posts');

export default PostsCollection;
