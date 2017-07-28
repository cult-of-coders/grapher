import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const PostsCollection = new Mongo.Collection('counts_posts');
PostsCollection.attachSchema(new SimpleSchema({
    _id: { type: String },
    text: { type: String },
}));

export default PostsCollection;
