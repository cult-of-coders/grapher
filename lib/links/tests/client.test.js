import { assert } from 'chai';

describe('Links Client Tests', function () {
  it('Test remove many', async function () {
    let PostCollection = new Mongo.Collection(null);
    let CommentCollection = new Mongo.Collection(null);

    PostCollection.addLinks({
      comments: {
        type: 'many',
        collection: CommentCollection,
        field: 'commentIds',
        index: true,
      },
    });

    let postId = PostCollection.insert({ text: 'abc' });
    let commentId = CommentCollection.insert({ text: 'abc' });

    const link = await PostCollection.getLink(postId, 'comments');
    await link.add(commentId);
    assert.lengthOf(link.find().fetch(), 1);

    await link.remove(commentId);

    assert.lengthOf(link.find().fetch(), 0);
  });
});
