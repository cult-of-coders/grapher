import Posts from '../../../query/testing/bootstrap/posts/collection';
import './queries';

console.log('adding method to update posts');

Meteor.methods({
  async updatePost({_id, title}) {
    await Posts.updateAsync({ _id }, { $set: { title } });
  },
});