import { assert } from 'chai';
import createFixtures from './fixtures';
import {
  Authors,
  AuthorProfiles,
  Groups,
  Posts,
  Categories,
} from './collections';

describe('Query Link Denormalization', function () {
  // increase this before for some reason Mongo 5 takes longer
  // to initiate the fixtures on the before hook
  this.timeout(1000 * 5);

  before(async function (done) {
    await createFixtures();
    done();
  });

  it('Should not cache work with nested options', async function () {
    let query = Posts.createQuery({
      $options: { limit: 5 },
      author: {
        $options: { limit: 1 },
        name: 1,
      },
    });

    let insideFind = false;
    stubFind(Authors, function () {
      insideFind = true;
    });

    await query.fetchAsync();
    assert.isTrue(insideFind);
  });

  it('Should work properly - One Direct', async function () {
    let query = Posts.createQuery({
      $options: { limit: 5 },
      author: {
        name: 1,
      },
    });

    let insideFind = false;
    stubFind(Authors, function () {
      insideFind = true;
    });

    // when fetching, Authors.find() should not be called
    let post = await query.fetchOneAsync();

    assert.isFalse(insideFind);
    assert.isObject(post.author);
    assert.isString(post.author._id);

    unstubFind(Authors);

    // now that we specify an additional field, it should bypass the cache
    query = Posts.createQuery({
      author: {
        name: 1,
        createdAt: 1,
      },
    });

    insideFind = false;
    stubFind(Authors, function () {
      insideFind = true;
    });

    await query.fetchAsync();
    assert.isTrue(insideFind);

    unstubFind(Authors);
  });

  it('Should work properly - One Inversed', async function () {
    let query = Authors.createQuery({
      $options: { limit: 2 },
      posts: {
        title: 1,
      },
    });

    let insideFind = false;
    stubFind(Posts, function () {
      insideFind = true;
    });

    let author = await query.fetchOneAsync();

    assert.isFalse(insideFind);
    assert.isArray(author.posts);
    assert.isObject(author.posts[0]);
    assert.isString(author.posts[0].title);
    assert.isString(author.posts[0]._id);

    unstubFind(Posts);

    // now that we specify an additional field, it should bypass the cache
    query = Authors.createQuery({
      $options: { limit: 2 },
      posts: {
        title: 1,
        createdAt: 1,
      },
    });

    insideFind = false;
    stubFind(Posts, function () {
      insideFind = true;
    });

    await query.fetchAsync();
    assert.isTrue(insideFind);

    unstubFind(Posts);
  });

  it('Should work properly - One Meta Direct', async function () {
    // console.log(Authors.find().fetch());

    let query = Authors.createQuery({
      $options: { limit: 5 },
      profile: {
        name: 1,
      },
    });

    let insideFind = false;
    stubFind(AuthorProfiles, function () {
      insideFind = true;
    });

    let author = await query.fetchOneAsync();

    assert.isFalse(insideFind);
    assert.isObject(author.profile);
    assert.isString(author.profile._id);

    unstubFind(AuthorProfiles);

    // now that we specify an additional field, it should bypass the cache
    query = Authors.createQuery({
      $options: { limit: 5 },
      profile: {
        name: 1,
        createdAt: 1,
      },
    });

    insideFind = false;
    stubFind(AuthorProfiles, function () {
      insideFind = true;
    });

    await query.fetchAsync();
    assert.isTrue(insideFind);

    unstubFind(AuthorProfiles);
  });

  it('Should work properly - One Meta Inversed', async function () {
    let query = AuthorProfiles.createQuery({
      $options: { limit: 5 },
      author: {
        name: 1,
      },
    });

    let insideFind = false;
    stubFind(Authors, function () {
      insideFind = true;
    });

    let profile = await query.fetchOneAsync();

    assert.isFalse(insideFind);
    assert.isObject(profile.author);
    assert.isString(profile.author._id);

    unstubFind(Authors);

    // now that we specify an additional field, it should bypass the cache
    query = AuthorProfiles.createQuery({
      $options: { limit: 5 },
      author: {
        name: 1,
        createdAt: 1,
      },
    });

    insideFind = false;
    stubFind(Authors, function () {
      insideFind = true;
    });

    await query.fetchAsync();
    assert.isTrue(insideFind);

    unstubFind(Authors);
  });

  it('Should work properly - Many Direct', async function () {
    let query = Authors.createQuery({
      $options: { limit: 5 },
      groups: {
        name: 1,
      },
    });

    let insideFind = false;
    stubFind(Groups, function () {
      insideFind = true;
    });

    let author = await query.fetchOneAsync();

    assert.isFalse(insideFind);
    assert.isArray(author.groups);
    assert.isObject(author.groups[0]);
    assert.isString(author.groups[0].name);
    assert.isString(author.groups[0]._id);

    unstubFind(Groups);

    query = Authors.createQuery({
      $options: { limit: 5 },
      groups: {
        name: 1,
        createdAt: 1,
      },
    });

    insideFind = false;
    stubFind(Groups, function () {
      insideFind = true;
    });

    await query.fetchAsync();
    assert.isTrue(insideFind);

    unstubFind(Groups);
  });

  it('Should work properly - Many Inversed', async function () {
    let query = Groups.createQuery({
      $options: { limit: 5 },
      authors: {
        name: 1,
      },
    });

    let insideFind = false;
    stubFind(Authors, function () {
      insideFind = true;
    });

    let group = await query.fetchOneAsync();

    assert.isFalse(insideFind);
    assert.isArray(group.authors);
    assert.isObject(group.authors[0]);
    assert.isString(group.authors[0].name);
    assert.isString(group.authors[0]._id);

    unstubFind(Authors);

    query = Groups.createQuery({
      $options: { limit: 5 },
      authors: {
        name: 1,
        createdAt: 1,
      },
    });

    insideFind = false;
    stubFind(Authors, function () {
      insideFind = true;
    });

    await query.fetchAsync();
    assert.isTrue(insideFind);

    unstubFind(Authors);
  });

  it('Should work properly - Many Meta Direct', async function () {
    // console.log(Posts.find({}, {limit: 2}).fetch());

    let query = Posts.createQuery({
      $options: { limit: 5 },
      categories: {
        name: 1,
      },
    });

    let insideFind = false;
    stubFind(Categories, function () {
      insideFind = true;
    });

    // when fetching, Authors.find() should not be called
    let post = await query.fetchOneAsync();

    assert.isFalse(insideFind);
    assert.isArray(post.categories);
    assert.isObject(post.categories[0]);
    assert.isString(post.categories[0]._id);

    unstubFind(Categories);

    // now that we specify an additional field, it should bypass the cache
    query = Posts.createQuery({
      categories: {
        name: 1,
        createdAt: 1,
      },
    });

    insideFind = false;
    stubFind(Categories, function () {
      insideFind = true;
    });

    await query.fetchAsync();
    assert.isTrue(insideFind);

    unstubFind(Categories);
  });

  it('Should work properly - Many Meta Inversed', async function () {
    let query = Categories.createQuery({
      $options: { limit: 2 },
      posts: {
        title: 1,
      },
    });

    let insideFind = false;
    stubFind(Posts, function () {
      insideFind = true;
    });

    let category = await query.fetchOneAsync();

    assert.isFalse(insideFind);
    assert.isArray(category.posts);
    assert.isObject(category.posts[0]);
    assert.isString(category.posts[0].title);
    assert.isString(category.posts[0]._id);

    unstubFind(Posts);

    // now that we specify an additional field, it should bypass the cache
    query = Categories.createQuery({
      $options: { limit: 2 },
      posts: {
        title: 1,
        createdAt: 1,
      },
    });

    insideFind = false;
    stubFind(Posts, function () {
      insideFind = true;
    });

    await query.fetchAsync();
    assert.isTrue(insideFind);

    unstubFind(Posts);
  });
});

function stubFind(collection, callback) {
  if (!collection.oldFind) {
    collection.oldFind = collection.find.bind(collection);
    collection.oldAggregate = collection.aggregate.bind(collection);
  }

  collection.find = function () {
    callback();
    return this.oldFind.apply(collection, arguments);
  }.bind(collection);

  collection.aggregate = function () {
    callback();
    return this.oldAggregate.apply(collection, arguments);
  }.bind(collection);
}

function unstubFind(collection) {
  collection.find = collection.oldFind.bind(collection);
  collection.aggregate = collection.oldAggregate.bind(collection);

  delete collection.oldFind;
  delete collection.oldAggregate;
}
