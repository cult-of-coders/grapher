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
  async resetPosts() {
    await PostsCollection.removeAsync({});
    await PostsCollection.insertAsync({ text: 'text 1' });
    await PostsCollection.insertAsync({ text: 'text 2' });
    await PostsCollection.insertAsync({ _id: 'removeid', text: 'text 3' });
  },

  async addPost(text) {
    return PostsCollection.insertAsync({ text });
  },

  async removePost(id) {
    await PostsCollection.removeAsync({ _id: id });
  },
});
