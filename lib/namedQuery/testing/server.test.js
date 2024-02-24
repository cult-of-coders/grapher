import { assert } from 'chai';
import {
  postList,
  postListCached,
  postListResolver,
  postListResolverCached,
  postListParamsCheck,
  postListParamsCheckServer,
  productsList,
  productAttributesList,
} from './bootstrap/queries';
import { createQuery, NamedQuery } from 'meteor/cultofcoders:grapher';
import { _ } from 'meteor/underscore';

describe('Named Query', function () {
  it('Should return the proper values', async function () {
    const createdQuery = createQuery({
      postList: {
        title: 'User Post - 3',
      },
    });

    const directQuery = postList.clone({
      title: 'User Post - 3',
    });

    for await (const query of [createdQuery, directQuery]) {
      const data = await query.fetchAsync();

      assert.isTrue(data.length > 1);

      for (const post of data) {
        assert.equal(post.title, 'User Post - 3');
        assert.isObject(post.author);
        assert.isObject(post.group);
      }
    }
  });

  it('Exposure embodyment should work properly', async function () {
    const query = createQuery({
      postListExposure: {
        title: 'User Post - 3',
      },
    });

    const data = await query.fetchAsync();

    assert.isTrue(data.length > 1);

    _.each(data, (post) => {
      assert.equal(post.title, 'User Post - 3');
      assert.isObject(post.author);
      assert.isObject(post.group);
    });
  });

  it('Should properly cache the values', async function (done) {
    const posts = await postListCached.fetchAsync();
    const postsCount = await postListCached.getCountAsync();

    const Posts = Mongo.Collection.get('posts');
    const postId = await Posts.insertAsync({ title: 'Hello Cacher!' });

    assert.equal(posts.length, (await postListCached.fetchAsync()).length);
    assert.equal(postsCount, await postListCached.getCountAsync());

    Meteor.setTimeout(async function () {
      const newPosts = await postListCached.fetchAsync();
      const newCount = await postListCached.getCountAsync();

      await Posts.removeAsync(postId);

      assert.isArray(newPosts);
      assert.isNumber(newCount);

      assert.equal(posts.length + 1, newPosts.length);
      assert.equal(postsCount + 1, newCount);

      done();
    }, 400);
  });

  it('Should allow to securely fetch a subbody of a namedQuery including embodiment', async function () {
    const query = createQuery({
      postListExposure: {
        limit: 5,
        title: 'User Post - 3',
        $body: {
          title: 1,
          createdAt: 1, // should fail
          group: {
            name: 1,
            createdAt: 1, // should fail
          },
        },
      },
    });

    const data = await query.fetchAsync();

    assert.isTrue(data.length > 0);

    _.each(data, (post) => {
      assert.equal(post.title, 'User Post - 3');
      assert.isUndefined(post.createdAt);
      assert.isUndefined(post.author);
      assert.isObject(post.group);
      assert.isUndefined(post.group.createdAt);
    });
  });

  it('Should work with resolver() queries with params', async function () {
    const title = 'User Post - 3';
    const createdQuery = createQuery({
      postListResolver: {
        title,
      },
    });

    const directQuery = postListResolver.clone({
      title,
    });

    let data = await createdQuery.fetchAsync();
    assert.isArray(data);
    assert.equal(title, data[0]);

    data = await directQuery.fetchAsync();
    assert.isArray(data);
    assert.equal(title, data[0]);
  });

  it('Should work with resolver() that is cached', async function () {
    const title = 'User Post - 3';
    let data = await postListResolverCached.clone({ title }).fetchAsync();

    assert.isArray(data);
    assert.equal(title, data[0]);

    data = await postListResolverCached.clone({ title }).fetchAsync();

    assert.isArray(data);
    assert.equal(title, data[0]);
  });

  it('Should work with resolver() that has params validation', async function (done) {
    try {
      await postListParamsCheck.clone({}).fetchAsync();
    } catch (e) {
      assert.isObject(e);
      done();
    }
  });

  it('Should work with resolver() that has params server-side validation', function (done) {
    try {
      postListParamsCheckServer.clone({}).fetch();
    } catch (e) {
      assert.isObject(e);
      done();
    }
  });

  it('Should respect config set by NamedQuery.setConfig', () => {
    NamedQuery.setConfig({ scoped: true });
    try {
      const query = createQuery('_namedQuery', {
        posts: {
          title: 1,
        },
      });

      assert.isTrue(query.options.scoped);
    } finally {
      NamedQuery.setConfig({});
    }
  });

  it('Should work with foreign field - regular link assembly', async () => {
    const res = await productAttributesList.clone().fetchAsync();
    assert.lengthOf(res, 3);

    res.forEach((attribute) => {
      if (typeof attribute.productId === 'number') {
        assert.isArray(attribute.products);
        assert.isTrue(attribute.products.length > 0);
        attribute.products.forEach((product) => {
          assert.equal(product.productId, attribute.productId);
        });
      } else {
        assert.isUndefined(attribute.products);
      }
    });
  });

  it('Should work with foreign field - inversed link assembly', async () => {
    const res = await productsList.clone({}).fetchAsync();

    assert.lengthOf(res, 4);

    res.forEach((product) => {
      if ([1, 2].includes(product.productId)) {
        assert.isArray(product.attributes);
        assert.lengthOf(product.attributes, 1);
        assert.equal(product.attributes[0].productId, product.productId);
      }
    });
  });
});
