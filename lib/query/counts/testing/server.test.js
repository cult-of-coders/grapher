import { Meteor } from 'meteor/meteor';
import PostsCollection from './bootstrap/collection.test';
import {
  postsQuery,
  postsQuery2,
  postsQuery3,
} from './bootstrap/namedQuery.test';

postsQuery.expose();
postsQuery2.expose();
postsQuery3.expose();

Meteor.methods({
  resetPosts() {
    PostsCollection.remove({});
    PostsCollection.insert({ text: 'text 1' });
    PostsCollection.insert({ text: 'text 2' });
    PostsCollection.insert({ _id: 'removeid', text: 'text 3' });
  },

  addPost(text) {
    return PostsCollection.insert({ text });
  },

  removePost(id) {
    PostsCollection.remove({ _id: id });
  },
});
