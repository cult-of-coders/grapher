import { assert, expect } from 'chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

//import {
//    PostCollection,
//    CategoryCollection,
//    CommentCollection,
//    ResolverCollection
//} from './collections.js';
let PostCollection = new Mongo.Collection('test_post');
let CategoryCollection = new Mongo.Collection('test_category');
let CommentCollection = new Mongo.Collection('test_comment');
let ResolverCollection = new Mongo.Collection('test_resolver');
let SCDCollection = new Mongo.Collection('test_scd');
let ReferenceCollection = new Mongo.Collection('test_scd_refs');

PostCollection.addLinks({
  comments: {
    type: '*',
    collection: CommentCollection,
    field: 'commentIds',
    index: true,
  },
  commentsUnique: {
    type: '*',
    collection: CommentCollection,
    field: 'commentUniqueIds',
    unique: true,
  },
  autoRemoveComments: {
    type: '*',
    collection: CommentCollection,
    field: 'autoRemoveCommentIds',
    autoremove: true,
  },
  autoRemovingSelfComments: {
    type: '*',
    collection: CommentCollection,
    field: 'autoRemovingSelfCommentsIds',
  },
  metaComments: {
    type: '*',
    collection: CommentCollection,
    metadata: true,
  },
  category: {
    collection: CategoryCollection,
    type: '1',
  },
  metaCategory: {
    metadata: true,
    collection: CategoryCollection,
    type: '1',
  },
  inversedComment: {
    collection: CommentCollection,
    inversedBy: 'inversedPost',
  },
});

CommentCollection.addLinks({
  post: {
    collection: PostCollection,
    inversedBy: 'comments',
  },
  postUnique: {
    collection: PostCollection,
    inversedBy: 'commentsUnique',
  },
  inversedPost: {
    collection: PostCollection,
    field: 'postId',
  },
  autoRemovePosts: {
    collection: PostCollection,
    inversedBy: 'autoRemovingSelfComments',
    autoremove: true,
  },
  metaPost: {
    collection: PostCollection,
    inversedBy: 'metaComments',
  },
});

CategoryCollection.addLinks({
  posts: {
    collection: PostCollection,
    inversedBy: 'category',
  },
  metaPosts: {
    collection: PostCollection,
    inversedBy: 'metaCategory',
  },
});

ReferenceCollection.addLinks({
  scds: {
    type: 'many',
    collection: SCDCollection,
    field: 'scdId',
    foreignIdentityField: 'originalId',
  },
  scd: {
    collection: SCDCollection,
    inversedBy: 'ref',
  },
});

SCDCollection.addLinks({
  refs: {
    collection: ReferenceCollection,
    inversedBy: 'scds',
    autoremove: true,
  },
  ref: {
    type: 'one',
    collection: ReferenceCollection,
    field: 'someId',
    foreignIdentityField: 'some2Id',
    autoremove: true,
  },
});

describe('Collection Links', function () {
  before(async () => {
    await PostCollection.removeAsync({});
    await CategoryCollection.removeAsync({});
    await CommentCollection.removeAsync({});
  });

  it('Test Many', async function () {
    let postId = await PostCollection.insertAsync({ text: 'abc' });
    let commentId = await CommentCollection.insertAsync({ text: 'abc' });

    let post = await PostCollection.findOneAsync(postId);
    const link = await PostCollection.getLink(post, 'comments');
    await link.add(commentId);
    assert.lengthOf(await link.find().fetchAsync(), 1);

    await link.remove(commentId);
    assert.lengthOf(await link.find().fetchAsync(), 0);
  });

  it('Tests One', async function () {
    let postId = await PostCollection.insertAsync({ text: 'abc' });
    let categoryId = await CategoryCollection.insertAsync({ text: 'abc' });

    let post = await PostCollection.findOneAsync(postId);

    const link = await PostCollection.getLink(post, 'category');
    await link.set(categoryId);
    assert.lengthOf(await link.find().fetchAsync(), 1);

    assert.equal(categoryId, (await link.fetch())._id);

    await link.unset();
    assert.lengthOf(await link.find().fetchAsync(), 0);
  });

  it('Tests One Meta', async function () {
    let postId = await PostCollection.insertAsync({ text: 'abc' });
    let categoryId = await CategoryCollection.insertAsync({ text: 'abc' });

    let post = await PostCollection.findOneAsync(postId);

    let link = await PostCollection.getLink(post, 'metaCategory');
    await link.set(categoryId, { date: new Date() });

    assert.lengthOf(await link.find().fetchAsync(), 1);
    let metadata = await link.metadata();

    assert.isObject(metadata);
    assert.instanceOf(metadata.date, Date);

    await link.metadata({
      updated: new Date(),
    });

    post = await PostCollection.findOneAsync(postId);
    link = await PostCollection.getLink(post, 'metaCategory');
    assert.instanceOf((await link.metadata()).updated, Date);

    await link.unset();
    assert.lengthOf(await link.find().fetchAsync(), 0);
  });

  it('Tests Many Meta', async function () {
    let postId = await PostCollection.insertAsync({ text: 'abc' });
    let commentId = await CommentCollection.insertAsync({ text: 'abc' });

    let post = await PostCollection.findOneAsync(postId);
    let metaCommentsLink = await PostCollection.getLink(post, 'metaComments');

    await metaCommentsLink.add(commentId, { date: new Date() });
    assert.lengthOf(await metaCommentsLink.find().fetchAsync(), 1);

    // verifying reverse search
    let metaComment = await CommentCollection.findOneAsync(commentId);
    let metaPostLink = await CommentCollection.getLink(metaComment, 'metaPost');
    assert.lengthOf(await metaPostLink.find().fetchAsync(), 1);

    let metadata = await metaCommentsLink.metadata(commentId);

    assert.isObject(metadata);
    assert.instanceOf(metadata.date, Date);

    await metaCommentsLink.metadata(commentId, { updated: new Date() });

    post = await PostCollection.findOneAsync(postId);
    metaCommentsLink = await PostCollection.getLink(post, 'metaComments');

    metadata = await metaCommentsLink.metadata(commentId);
    assert.instanceOf(metadata.updated, Date);

    await metaCommentsLink.remove(commentId);
    assert.lengthOf(await metaCommentsLink.find().fetchAsync(), 0);
  });

  it('Tests $meta filters for One & One-Virtual', async function () {
    let postId = await PostCollection.insertAsync({ text: 'abc' });
    let categoryId = await CategoryCollection.insertAsync({ text: 'abc' });
    let post = await PostCollection.findOneAsync(postId);
    let postMetaCategoryLink = await PostCollection.getLink(
      post,
      'metaCategory',
    );
    await postMetaCategoryLink.set(categoryId, { valid: true });

    let result = await postMetaCategoryLink.fetch({ $meta: { valid: true } });
    assert.isObject(result);

    result = await postMetaCategoryLink.fetch({ $meta: { valid: false } });

    assert.isUndefined(result);
    const metaCategoryPostLink = await CategoryCollection.getLink(
      categoryId,
      'metaPosts',
    );

    result = await metaCategoryPostLink.fetch({ $meta: { valid: true } });
    assert.lengthOf(result, 1);

    result = await metaCategoryPostLink.fetch({ $meta: { valid: false } });
    assert.lengthOf(result, 0);
  });

  it('Tests $meta filters for Many & Many-Virtual', async function () {
    let postId = await PostCollection.insertAsync({ text: 'abc' });
    let commentId1 = await CommentCollection.insertAsync({ text: 'abc' });
    let commentId2 = await CommentCollection.insertAsync({ text: 'abc' });

    let postMetaCommentsLink = await PostCollection.getLink(
      postId,
      'metaComments',
    );

    await postMetaCommentsLink.add(commentId1, { approved: true });
    await postMetaCommentsLink.add(commentId2, { approved: false });

    let result = await postMetaCommentsLink.fetch({
      $meta: { approved: true },
    });

    assert.lengthOf(result, 1);

    result = await postMetaCommentsLink.fetch({ $meta: { approved: false } });

    assert.lengthOf(result, 1);

    const comment1MetaPostsLink = await CommentCollection.getLink(
      commentId1,
      'metaPost',
    );
    result = await comment1MetaPostsLink.fetch({ $meta: { approved: true } });
    assert.lengthOf(result, 1);
    result = await comment1MetaPostsLink.fetch({ $meta: { approved: false } });
    assert.lengthOf(result, 0);

    const comment2MetaPostsLink = await CommentCollection.getLink(
      commentId2,
      'metaPost',
    );
    result = await comment2MetaPostsLink.fetch({ $meta: { approved: true } });
    assert.lengthOf(result, 0);
    result = await comment2MetaPostsLink.fetch({ $meta: { approved: false } });
    assert.lengthOf(result, 1);
  });

  it('Tests inversedBy findings', async function () {
    let postId = await PostCollection.insertAsync({ text: 'abc' });
    let commentId = await CommentCollection.insertAsync({ text: 'abc' });

    let post = await PostCollection.findOneAsync(postId);
    let comment = await CommentCollection.findOneAsync(commentId);
    let commentsLink = await PostCollection.getLink(post, 'comments');
    let commentsUniqueLink = await PostCollection.getLink(
      post,
      'commentsUnique',
    );
    let metaCommentsLink = await PostCollection.getLink(post, 'metaComments');
    let postLink = await CommentCollection.getLink(comment, 'post');
    let postUniqueLink = await CommentCollection.getLink(comment, 'postUnique');
    let postMetaLink = await CommentCollection.getLink(comment, 'metaPost');

    await commentsLink.add(comment);
    await commentsUniqueLink.add(comment);
    await metaCommentsLink.add(comment);

    assert.lengthOf(await postLink.find().fetchAsync(), 1);
    assert.isObject(await postUniqueLink.fetch());
    assert.lengthOf(await postMetaLink.find().fetchAsync(), 1);

    post = await PostCollection.findOneAsync(postId);

    const removeRes = await CommentCollection.removeAsync(comment._id);

    post = await PostCollection.findOneAsync(postId);
    assert.notInclude(post.commentIds, comment._id);
  });

  it('Should auto-save object', async function () {
    let comment = { text: 'abc' };

    let postId = await PostCollection.insertAsync({ text: 'hello' });
    const postLink = await PostCollection.getLink(postId, 'comments');
    await postLink.add(comment);

    assert.isDefined(comment._id);
    assert.lengthOf(await postLink.fetch(), 1);
  });

  it('Should have indexes set up', async function () {
    /**
     * @type {import('mongodb').Collection}
     */
    const raw = PostCollection.rawCollection();
    const indexes = await raw.indexes();

    const found = _.find(indexes, (index) => {
      return index.key.commentIds == 1;
    });

    assert.isObject(found);
  });

  it('Should auto-remove some objects', async function () {
    let comment = { text: 'abc' };

    let postId = await PostCollection.insertAsync({ text: 'hello' });
    let postLink = await PostCollection.getLink(postId, 'comments');
    await postLink.add(comment);

    assert.isNotNull(comment._id);
    await PostCollection.removeAsync(postId);
    assert.isNotNull(await CommentCollection.findOneAsync(comment._id));

    comment = { text: 'abc' };
    postId = await PostCollection.insertAsync({ text: 'hello' });
    postLink = await PostCollection.getLink(postId, 'autoRemoveComments');
    await postLink.add(comment);

    assert.isDefined(comment._id);
    await PostCollection.removeAsync(postId);
    assert.isUndefined(await CommentCollection.findOneAsync(comment._id));
  });

  it('Should allow actions from inversed links', async function () {
    let abcComment = { text: 'abc' };

    let helloPostId = await PostCollection.insertAsync({ text: 'hello' });
    const abcCommentId = await CommentCollection.insertAsync(abcComment);

    let abcCommentToPostLink = await CommentCollection.getLink(
      abcCommentId,
      'post',
    );
    await abcCommentToPostLink.set(helloPostId);

    const helloPostToCommentsLink = await PostCollection.getLink(
      helloPostId,
      'comments',
    );

    const helloPostComments = await helloPostToCommentsLink.fetch();

    assert.lengthOf(helloPostComments, 1);
    assert.equal(helloPostComments[0]._id, abcCommentId);

    // Add "hi there" post
    abcCommentToPostLink = await CommentCollection.getLink(
      abcCommentId,
      'post',
    );
    await abcCommentToPostLink.add({
      text: 'hi there',
    });

    let insertedPostViaVirtual = await PostCollection.findOneAsync({
      text: 'hi there',
    });
    assert.isObject(insertedPostViaVirtual);

    assert.lengthOf(
      await (
        await PostCollection.getLink(insertedPostViaVirtual, 'comments')
      ).fetch(),
      1,
    );

    let categoryId = await CategoryCollection.insertAsync({ text: 'abc' });
    const category = await CategoryCollection.findOneAsync(categoryId);
    let postsCategoryLink = await CategoryCollection.getLink(category, 'posts');
    await postsCategoryLink.add(insertedPostViaVirtual);

    assert.equal(
      category._id,
      (
        await (
          await PostCollection.getLink(insertedPostViaVirtual, 'category')
        ).fetch()
      )._id,
    );

    // TESTING META
    let categoryMetaPostLink = await CategoryCollection.getLink(
      category,
      'metaPosts',
    );
    await categoryMetaPostLink.add(insertedPostViaVirtual, {
      testValue: 'boom!',
    });

    let postMetaCategoryLink = await PostCollection.getLink(
      insertedPostViaVirtual,
      'metaCategory',
    );
    assert.equal('boom!', (await postMetaCategoryLink.metadata()).testValue);
  });

  it('Should fail when you try to add a non-existing link', async function () {
    let postId = await PostCollection.insertAsync({ text: 'hello' });

    try {
      const link = await PostCollection.getLink(postId, 'comments');
      await link.add('XXXXXXX');

      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.equal(e.error, 'not-found');
    }
  });

  it('Should work with autoremoval from inversed and direct link', async function () {
    // autoremoval from direct side
    let postId = await PostCollection.insertAsync({ text: 'autoremove' });
    const postAutoRemoveCommentsLink = await PostCollection.getLink(
      postId,
      'autoRemoveComments',
    );

    await postAutoRemoveCommentsLink.add({ text: 'hello' });

    const comments = await postAutoRemoveCommentsLink.find().fetchAsync();
    assert.lengthOf(comments, 1);
    let commentId = comments[0]._id;

    assert.isObject(await CommentCollection.findOneAsync(commentId));
    await PostCollection.removeAsync(postId);
    assert.isUndefined(await CommentCollection.findOneAsync(commentId));

    // now from inversed side
    commentId = await CommentCollection.insertAsync({ text: 'autoremove' });

    const commentAutoRemovePostsLink = await CommentCollection.getLink(
      commentId,
      'autoRemovePosts',
    );
    await commentAutoRemovePostsLink.add({ text: 'Hello' });

    const posts = await commentAutoRemovePostsLink.find().fetchAsync();
    assert.lengthOf(posts, 1);
    postId = posts[0]._id;

    assert.isObject(await PostCollection.findOneAsync(postId));
    await CommentCollection.removeAsync(commentId);
    assert.isUndefined(await PostCollection.findOneAsync(postId));
  });

  it.skip('Should set meta link in inversed one-meta', async function () {
    const CollectionA = new Mongo.Collection('collectionA' + Random.id());
    const CollectionB = new Mongo.Collection('collectionB' + Random.id());

    CollectionA.addLinks({
      oneMeta: {
        collection: CollectionB,
        field: 'oneMetaLink',
        type: 'one',
        metadata: true,
      },
    });

    CollectionB.addLinks({
      oneMetaA: {
        collection: CollectionA,
        inversedBy: 'oneMeta',
      },
    });

    const ADocId = await CollectionA.insertAsync({ value: 3 });
    const BDocId = await CollectionB.insertAsync({ value: 5 });

    // console.log({ADocId, BDocId})

    const link = await CollectionB.getLink(BDocId, 'oneMetaA');
    await link.set(ADocId, {
      data: 'someData',
    });

    // TODO(v3): update create query
    const result = CollectionA.createQuery({
      $filters: { _id: ADocId },
      oneMeta: { _id: 1, metadata: 1 },
    }).fetchOne();

    assert.equal('someData', result.oneMeta.$metadata.data);
  });

  it('Should not result in duplicate key error on Many Unique links', async function () {
    let postIdA = await PostCollection.insertAsync({ text: 'abc' });
    let postIdB = await PostCollection.insertAsync({ text: 'abc' });

    await PostCollection.removeAsync(postIdA);
    await PostCollection.removeAsync(postIdB);
  });

  describe('foreignIdentityField linkConfig param', function () {
    beforeEach(async function () {
      await SCDCollection.removeAsync({});
      await ReferenceCollection.removeAsync({});
    });

    it('Works with foreign field - many', async function () {
      await SCDCollection.insertAsync({ _id: '1', originalId: '1' });
      await SCDCollection.insertAsync({ _id: '2', originalId: '1' });
      await SCDCollection.insertAsync({ _id: '3', originalId: '3' });
      const scd4Id = await SCDCollection.insertAsync({
        _id: '4',
        originalId: '4',
      });

      await ReferenceCollection.insertAsync({ scdId: '1' });
      await ReferenceCollection.insertAsync({ scdId: '3' });
      const ref3Id = await ReferenceCollection.insertAsync({});

      const linkRef = await ReferenceCollection.getLink({ scdId: '1' }, 'scds');
      // both SCDs should be found since they share originalId
      assert.lengthOf(await linkRef.find().fetchAsync(), 2);

      const linkSCD = await SCDCollection.getLink(
        { _id: '2', originalId: '1' },
        'refs',
      );
      assert.lengthOf(await linkSCD.find().fetchAsync(), 1);

      // check if it works when links do not exist
      const link = await ReferenceCollection.getLink(ref3Id, 'scds');
      assert.lengthOf(await link.find().fetchAsync(), 0);

      const inversedLink = await SCDCollection.getLink(scd4Id, 'refs');
      assert.lengthOf(await inversedLink.find().fetchAsync(), 0);
    });

    it('Auto-removes for foreign field - many', async function () {
      await SCDCollection.insertAsync({ _id: '1', originalId: '1' });
      await SCDCollection.insertAsync({ _id: '2', originalId: '1' });

      await ReferenceCollection.insertAsync({ scdId: '1' });

      // assert.equal(ReferenceCollection.find().count(), 0);
      await SCDCollection.removeAsync('1');

      assert.equal(await ReferenceCollection.find().countAsync(), 0);
    });

    it('Works with foreign field - one', async function () {
      await SCDCollection.insertAsync({ someId: '1' });

      await ReferenceCollection.insertAsync({ some2Id: '1' });
      const ref2Id = await ReferenceCollection.insertAsync({ some2Id: '2' });

      const linkSCD = await SCDCollection.getLink({ someId: '1' }, 'ref');
      assert.lengthOf(await linkSCD.find().fetchAsync(), 1);

      const linkRef = await ReferenceCollection.getLink(
        { some2Id: '1' },
        'scd',
      );
      assert.lengthOf(await linkRef.find().fetchAsync(), 1);

      // check if it works when links do not exist
      const newId = await SCDCollection.insertAsync({}); // no someId
      const link = await SCDCollection.getLink(newId, 'ref');
      assert.lengthOf(await link.find().fetchAsync(), 0);

      // inversed
      const inversedLink = await ReferenceCollection.getLink(ref2Id, 'scd');
      assert.lengthOf(await inversedLink.find().fetchAsync(), 0);
    });

    it('Auto-removes for foreign field - one', async function () {
      await SCDCollection.insertAsync({ _id: '1', someId: '1' });

      await ReferenceCollection.insertAsync({ some2Id: '1' });
      await ReferenceCollection.insertAsync({ some2Id: '2' });

      await SCDCollection.removeAsync('1');

      assert.equal(await ReferenceCollection.find().countAsync(), 1);
    });
  });
});
