import { assert, expect } from 'chai';
import dot from 'dot-object';

import { createQuery } from 'meteor/cultofcoders:grapher';
import { Random } from 'meteor/random';
import Comments from './bootstrap/comments/collection.js';
import Posts from './bootstrap/posts/collection.js';
import Tags from './bootstrap/tags/collection.js';
import { Files } from './bootstrap/files/collection';
import { Projects } from './bootstrap/projects/collection';
// TODO(v3): include after links are tested
// import "./metaFilters.server.test";
// import "./reducers.server.test";
// import "./link-cache/server.test";
import intersectDeep from '../lib/intersectDeep.js';
import { _ } from 'meteor/underscore';

// Used in some tests below
const Users = new Mongo.Collection('__many_inversed_users');
const Restaurants = new Mongo.Collection('__many_inversed_restaurants');
const ShoppingCart = new Mongo.Collection('__projection_operators_cart');
const Clients = new Mongo.Collection('__text_search_clients');
await Clients.createIndexAsync({ name: 'text' });

Clients.addLinks({
  shoppingCart: {
    type: 'one',
    collection: ShoppingCart,
    metadata: true,
    field: 'shoppingCartData',
    unique: true,
  },

  shoppingCarts: {
    collection: ShoppingCart,
    type: 'many',
    metadata: true,
    field: 'shoppingCartsData',
  },
});

ShoppingCart.addLinks({
  user: {
    collection: Clients,
    inversedBy: 'shoppingCart',
  },

  users: {
    collection: Clients,
    inversedBy: 'shoppingCarts',
  },
});

// for storeOneResults tests
const Level1 = new Mongo.Collection('level1');
const Level2 = new Mongo.Collection('level2');
const Level3 = new Mongo.Collection('level3');
const Level4 = new Mongo.Collection('level4');
Level1.addLinks({
  level2: {
    type: 'one',
    collection: Level2,
    field: 'level2Id',
  },
});
Level2.addLinks({
  level3: {
    type: 'one',
    collection: Level3,
    field: 'level3Id',
  },
});
Level3.addLinks({
  level4: {
    type: 'one',
    collection: Level4,
    field: 'level4Id',
  },
});

describe('Hypernova', function () {
  it('Should not crash due to nested filters', async () => {
    const id = `Nested filters_${Random.id()}`;
    const A = new Mongo.Collection(`${id}_a`);
    const B = new Mongo.Collection(`${id}_b`);
    const C = new Mongo.Collection(`${id}_c`);

    B.addLinks({
      as: {
        type: 'many',
        collection: A,
        field: 'a_ids',
        unique: true,
      },
    });

    A.addLinks({
      b: {
        collection: B,
        inversedBy: 'as',
      },

      c: {
        type: 'one',
        collection: C,
        field: 'c_id',
      },
    });

    const cId = await C.insertAsync({
      foo: true,
    });

    const aIdA = await A.insertAsync({
      foo: true,
      bar: true,
      c_id: cId,
    });

    const aIdB = await A.insertAsync({
      foo: true,
      bar: false,
      c_id: cId,
    });

    await B.insertAsync({
      foo: true,
      a_ids: [aIdA, aIdB],
    });

    const data = await A.createQuery({
      $filters: {
        foo: true,
      },
      b: {
        $filters: {
          foo: true,
        },
        as: {
          $filters: {
            foo: true,
            bar: true,
          },
          c: {
            foo: 1,
          },
        },
      },
    }).fetchAsync();

    assert.lengthOf(data, 2);
    assert.lengthOf(data[0].b.as, 1);
    assert.lengthOf(data[1].b.as, 1);
    assert.isTrue(data[0].b.as[0].c.foo);
    assert.isTrue(data[1].b.as[0].c.foo);
  });

  it('Should support projection operators', async () => {
    await ShoppingCart.removeAsync({});
    await ShoppingCart.insertAsync({
      date: new Date(),
      items: [
        {
          title: 'Item 1',
          price: 30,
        },
        {
          title: 'Item 2',
          price: 50,
        },
      ],
    });

    const data = await ShoppingCart.createQuery({
      items: { $elemMatch: { price: { $gt: 40 } } },
    }).fetchAsync();

    assert.lengthOf(data, 1);
    assert.lengthOf(data[0].items, 1);
  });

  it('Should properly handle text search with sorting and score value projection', async () => {
    await Clients.removeAsync({});
    await Clients.insertAsync({ name: 'John Doe', age: 23 });
    await Clients.insertAsync({ name: 'John F McNull', age: 23 });
    await Clients.insertAsync({ name: 'Mary Smith', age: 40 });

    const data = await Clients.createQuery({
      $filters: {
        $text: { $search: 'john' },
      },
      $options: {
        sort: {
          score: { $meta: 'textScore' },
        },
      },
      score: { $meta: 'textScore' },
    }).fetchAsync();

    assert.lengthOf(data, 2);
    data.forEach((client) => {
      // unspecified fields must be excluded
      assert.isUndefined(client.name);
      assert.isUndefined(client.age);

      // _id and score should be included
      assert.isString(client._id);
      assert.isNumber(client.score);
    });

    // sort check
    const [client1, client2] = data;
    assert.isTrue(client1.score > client2.score);
  });

  it('Should fetch One links correctly', async function () {
    const data = await createQuery({
      comments: {
        text: 1,
        author: {
          name: 1,
        },
      },
    }).fetchAsync();

    assert.lengthOf(data, await Comments.find().countAsync());
    assert.isTrue(data.length > 0);

    _.each(data, (comment) => {
      assert.isObject(comment.author);
      assert.isString(comment.author.name);
      assert.isString(comment.author._id);
      assert.isTrue(_.keys(comment.author).length == 2);
    });
  });

  it('Should fetch One links with limit and options', async function () {
    const data = await createQuery({
      comments: {
        $options: { limit: 5 },
        text: 1,
      },
    }).fetch();

    assert.lengthOf(data, 5);
  });

  it('Should fetch One-Inversed links with limit and options', async function () {
    const query = createQuery(
      {
        authors: {
          $options: { limit: 5 },
          comments: {
            $filters: { text: 'Good' },
            $options: { limit: 2 },
            text: 1,
          },
        },
      },
      {},
      { debug: true },
    );

    const data = await query.fetchAsync();

    assert.lengthOf(data, 5);
    _.each(data, (author) => {
      assert.lengthOf(author.comments, 2);
      _.each(author.comments, (comment) => {
        assert.equal('Good', comment.text);
      });
    });
  });

  it('Should fetch Many links correctly', async function () {
    const data = await createQuery({
      posts: {
        $options: { limit: 5 },
        title: 1,
        tags: {
          text: 1,
        },
      },
    }).fetchAsync();

    assert.lengthOf(data, 5);
    _.each(data, (post) => {
      assert.isString(post.title);
      assert.isArray(post.tags);
      assert.isTrue(post.tags.length > 0);
    });
  });

  it('Should fetch Many - inversed links correctly', async function () {
    const data = await createQuery({
      tags: {
        name: 1,
        posts: {
          $options: { limit: 5 },
          title: 1,
        },
      },
    }).fetchAsync();

    _.each(data, (tag) => {
      assert.isString(tag.name);
      assert.isArray(tag.posts);
      assert.isTrue(tag.posts.length <= 5);
      _.each(tag.posts, (post) => {
        assert.isString(post.title);
      });
    });
  });

  it('Should fetch Many - inversed links correctly #2', async function () {
    const post1Id = await Posts.insertAsync({ name: 'Post1' });
    const post2Id = await Posts.insertAsync({ name: 'Post2' });
    const post3Id = await Posts.insertAsync({ name: 'Post3' });
    const post4Id = await Posts.insertAsync({ name: 'Post4' });

    const tag1Id = await Tags.insertAsync({ name: 'Tag1' });
    const tag2Id = await Tags.insertAsync({ name: 'Tag2' });
    const tag3Id = await Tags.insertAsync({ name: 'Tag3' });

    async function addTags(postId, tagIds) {
      return Posts.updateAsync(postId, {
        $set: {
          tagIds,
        },
      });
    }

    await addTags(post1Id, [tag1Id, tag2Id]);
    await addTags(post2Id, [tag1Id]);
    await addTags(post3Id, [tag2Id, tag3Id]);
    await addTags(post4Id, [tag3Id, tag1Id]);

    const data = await createQuery({
      tags: {
        $filters: {
          _id: { $in: [tag1Id, tag2Id, tag3Id] },
        },
        name: 1,
        posts: {
          name: 1,
        },
      },
    }).fetchAsync();

    const tag1Data = _.find(data, (doc) => doc.name === 'Tag1');
    const tag2Data = _.find(data, (doc) => doc.name === 'Tag2');
    const tag3Data = _.find(data, (doc) => doc.name === 'Tag3');

    function hasPost(tag, postName) {
      return !!_.find(tag.posts, (post) => post.name === postName);
    }
    assert.lengthOf(tag1Data.posts, 3);
    assert.isTrue(hasPost(tag1Data, 'Post1'));
    assert.isTrue(hasPost(tag1Data, 'Post2'));
    assert.isTrue(hasPost(tag1Data, 'Post4'));

    assert.lengthOf(tag2Data.posts, 2);
    assert.isTrue(hasPost(tag2Data, 'Post1'));
    assert.isTrue(hasPost(tag2Data, 'Post3'));

    assert.lengthOf(tag3Data.posts, 2);
    assert.isTrue(hasPost(tag3Data, 'Post3'));
    assert.isTrue(hasPost(tag3Data, 'Post4'));

    await Posts.removeAsync({
      _id: { $in: [post1Id, post2Id, post3Id, post4Id] },
    });
    await Tags.removeAsync({
      _id: { $in: [tag1Id, tag2Id, tag3Id] },
    });
  });

  it('Should fetch One-Meta links correctly', async function () {
    const data = await createQuery({
      posts: {
        $options: { limit: 5 },
        title: 1,
        group: {
          name: 1,
        },
      },
    }).fetch();

    assert.lengthOf(data, 5);
    _.each(data, (post) => {
      assert.isString(post.title);
      assert.isString(post._id);
      assert.isObject(post.group);
      assert.isString(post.group._id);
      assert.isString(post.group.name);
    });
  });

  it('Should fetch One-Meta inversed links correctly', async function () {
    const data = await createQuery({
      groups: {
        name: 1,
        posts: {
          title: 1,
        },
      },
    }).fetchAsync();

    _.each(data, (group) => {
      assert.isString(group.name);
      assert.isString(group._id);
      assert.lengthOf(_.keys(group), 3);
      assert.isArray(group.posts);
      _.each(group.posts, (post) => {
        assert.isString(post.title);
        assert.isString(post._id);
      });
    });
  });

  it('Should fetch Many-Meta links correctly', async function () {
    const data = await createQuery({
      authors: {
        name: 1,
        groups: {
          $options: { limit: 1 },
          name: 1,
        },
      },
    }).fetchAsync();

    _.each(data, (author) => {
      assert.isArray(author.groups);
      assert.lengthOf(author.groups, 1);

      _.each(author.groups, (group) => {
        assert.isObject(group);
        assert.isString(group._id);
        assert.isString(group.name);
      });
    });
  });

  it('Should fetch Many-Meta links correctly where parent is One link', async function () {
    const data = await createQuery({
      posts: {
        $options: { limit: 5 },
        author: {
          groups: {
            isAdmin: 1,
          },
        },
      },
    }).fetchAsync();

    // console.log(JSON.stringify(data, null, 2));

    _.each(data, (post) => {
      assert.isObject(post.author);
      assert.isArray(post.author.groups);

      _.each(post.author.groups, (group) => {
        assert.isObject(group.$metadata);
        assert.isBoolean(group.$metadata.isAdmin);
      });
    });
  });

  it('Should fetch Many-Meta inversed links correctly', async function () {
    const data = await createQuery({
      groups: {
        name: 1,
        authors: {
          $options: { limit: 2 },
          name: 1,
        },
      },
    }).fetchAsync();

    _.each(data, (group) => {
      assert.isArray(group.authors);
      assert.isTrue(group.authors.length <= 2);

      _.each(group.authors, (author) => {
        assert.isObject(author);
        assert.isString(author._id);
        assert.isString(author.name);
      });
    });
  });

  it('Should fetch direct One & Many Meta links with $metadata', async function () {
    let data = await createQuery({
      posts: {
        group: {
          name: 1,
        },
      },
    }).fetch();

    _.each(data, (post) => {
      assert.isObject(post.group.$metadata);
      assert.isDefined(post.group.$metadata.random);
    });

    data = await createQuery({
      authors: {
        groups: {
          $options: { limit: 1 },
          name: 1,
        },
      },
    }).fetchAsync();

    _.each(data, (author) => {
      assert.isArray(author.groups);

      _.each(author.groups, (group) => {
        assert.isObject(group.$metadata);
      });
    });
  });

  it('Should fetch direct One Meta links with $metadata that are under a nesting level', async function () {
    let authors = await createQuery({
      authors: {
        $options: { limit: 1 },
        posts: {
          $options: { limit: 1 },
          group: {
            name: 1,
          },
        },
      },
    }).fetchAsync();

    let data = authors[0];

    _.each(data.posts, (post) => {
      assert.isObject(post.group.$metadata);
      assert.isDefined(post.group.$metadata.random);
    });
  });

  it('Should fetch Inversed One & Many Meta links with $metadata', async function () {
    let data = await createQuery({
      groups: {
        posts: {
          group_groups_meta: 1,
          title: 1,
        },
      },
    }).fetchAsync();

    _.each(data, (group) => {
      _.each(group.posts, (post) => {
        assert.isObject(post.$metadata);
        assert.isDefined(post.$metadata.random);
      });
    });

    data = await createQuery({
      groups: {
        authors: {
          $options: { limit: 1 },
          name: 1,
        },
      },
    }).fetchAsync();

    _.each(data, (group) => {
      _.each(group.authors, (author) => {
        assert.isObject(author.$metadata);
      });
    });
  });

  it('Should fetch in depth properly at any given level.', async function () {
    const data = await createQuery({
      authors: {
        $options: { limit: 5 },
        posts: {
          $options: { limit: 5 },
          comments: {
            $options: { limit: 5 },
            author: {
              groups: {
                posts: {
                  $options: { limit: 5 },
                  author: {
                    name: 1,
                  },
                },
              },
            },
          },
        },
      },
    }).fetchAsync();

    assert.lengthOf(data, 5);
    let arrivedInDepth = false;

    _.each(data, (author) => {
      _.each(author.posts, (post) => {
        _.each(post.comments, (comment) => {
          _.each(comment.author.groups, (group) => {
            _.each(group.posts, (post) => {
              assert.isObject(post.author);
              assert.isString(post.author.name);
              arrivedInDepth = true;
            });
          });
        });
      });
    });

    assert.isTrue(arrivedInDepth);
  });

  it('Should not throw when nested fields have identical documents', async function () {
    await Level1.removeAsync({});
    await Level2.removeAsync({});
    await Level3.removeAsync({});
    await Level4.removeAsync({});

    /**
     * When prepareForDelivery() calls storeOneResults() in case of deep nested fields, sometimes
     * it happens that in sameLevelResults are passed non-array values resulting in incorrent behaviour
     * with for example null fields.
     *
     * Consider the example (only links are shown and all links are of type one):
     *
     * RootDoc1 --
     *             \
     *               => Child => GrandChild => GrandGrandChild
     *             /
     * RootDoc2 --
     *
     * - RootDoc1 and RootDoc2 share the *same* Child object.
     * - storeOneResults() mutates objects
     *
     * What happens:
     * 0. We fetched the results in hypernova and now we are in prepareForDeliver() calling storeOneResults()
     * 1. At first:
     *      both RootDoc1 and RootDoc2 have an array of length 1 in Child field,
     *      Child has array of GrandChild of length 1
     *      GrandChild has array of GrandGrandChild of length 1
     *
     * 2. Since storeOneResults() is recursive it comes to the bottom of the graph first, removing array on GrandChild.GrandGrandChild
     * 3. Then it removes GrandChild array on Child document.
     * 4. After that it goes to the RootDoc2 instance, but since object are shared between RootDoc1 and RootDoc2,
     * in recursive call result[collectionNode.linkName] is no longer array, but object.
     * Therefore, _.each(sameLevelResults) now iterates over object with all kind of unwanted consequences.
     *
     * sampleField in example below is show how null field can force prepareToDelivery() into crash with
     * error "Cannot read property 'level4' of null"
     *
     */

    const level4Id = await Level4.insertAsync({ title: 'Level 4' });
    const level3Id = await Level3.insertAsync({
      title: 'Level 3',
      level4Id,
      sampleField: null,
    });
    const level2Id = await Level2.insertAsync({ title: 'Level 2', level3Id });

    await Level1.insertAsync({ title: 'Level 1 #1', level2Id });
    await Level1.insertAsync({ title: 'Level 1 #2', level2Id });

    expect(async () => {
      await Level1.createQuery({
        title: 1,
        level2: {
          title: 1,
          sampleField: 1,
          level3: {
            title: 1,
            sampleField: 1,
            level4: {
              title: 1,
            },
          },
        },
      }).fetchAsync();
    }).to.not.throw();
  });

  it('Should work with filters of $and and $or on subcollections', async function () {
    let data = await createQuery({
      posts: {
        comments: {
          $filters: {
            $and: [
              {
                text: 'Good',
              },
            ],
          },
          text: 1,
        },
      },
    }).fetchAsync();

    data.forEach((post) => {
      if (post.comments) {
        post.comments.forEach((comment) => {
          assert.equal(comment.text, 'Good');
        });
      }
    });
  });

  it('Should work sorting with options that contain a dot', async function () {
    let data = await createQuery({
      posts: {
        author: {
          $filter({ options }) {
            options.sort = {
              'profile.firstName': 1,
            };
          },
          profile: 1,
        },
      },
    }).fetchAsync();

    assert.isArray(data);
  });

  it('Should properly clone and work with setParams', function () {
    let query = createQuery({
      posts: {
        $options: { limit: 5 },
      },
    });

    let clone = query.clone({});

    assert.isFunction(clone.fetch);
    assert.isFunction(clone.fetchOne);
    assert.isFunction(clone.setParams);
    assert.isFunction(clone.setParams({}).fetchOne);
  });

  it('Should work with $postFilters', async function () {
    let query = createQuery({
      posts: {
        $postFilters: {
          'comments.text': 'Non existing comment',
        },
        title: 1,
        comments: {
          text: 1,
        },
      },
    });

    const data = await query.fetchAsync();
    assert.lengthOf(data, 0);

    query = createQuery({
      posts: {
        $postFilters: {
          'comments.text': 'Good',
        },
        title: 1,
        comments: {
          text: 1,
        },
      },
    });

    assert.isTrue((await query.fetchAsync()).length > 0);
  });

  it('Should work with $postOptions', async function () {
    let query = createQuery({
      posts: {
        $postOptions: {
          limit: 5,
          skip: 5,
          sort: { title: 1 },
        },
        title: 1,
        comments: {
          text: 1,
        },
      },
    });

    const data = await query.fetchAsync();
    assert.lengthOf(data, 5);
  });

  it('Should work with $postFilter and params', async function (done) {
    let query = createQuery({
      posts: {
        $postFilter(results, params) {
          assert.equal(params.text, 'Good');
          done();
        },
        title: 1,
        comments: {
          text: 1,
        },
      },
    });

    query.setParams({
      text: 'Good',
    });

    await query.fetchAsync();
  });

  it('Should work with a nested field from reversedSide using aggregation framework', async function () {
    let query = createQuery({
      groups: {
        $options: { limit: 1 },
        authors: {
          profile: {
            firstName: 1,
          },
        },
      },
    });

    const data = await query.fetchAsync();
    assert.lengthOf(data, 1);

    const group = data[0];

    assert.isArray(group.authors);
    assert.isTrue(group.authors.length > 0);

    const author = group.authors[0];
    assert.isObject(author);
    assert.isObject(author.profile);
    assert.isString(author.profile.firstName);
    assert.isUndefined(author.profile.lastName);
  });

  it('Should apply a default filter function to first root', async function () {
    let query = createQuery(
      {
        groups: {
          authors: {},
        },
      },
      {
        params: {
          options: { limit: 1 },
          filters: {
            name: 'JavaScript',
          },
        },
      },
    );

    const data = await query.fetchAsync();
    assert.lengthOf(data, 1);
    const group = data[0];
    assert.isArray(group.authors);
    assert.isTrue(group.authors.length > 0);
  });

  Restaurants.addLinks({
    users: {
      type: 'many',
      field: 'userIds',
      collection: Users,
    },
  });

  Users.addLinks({
    restaurants: {
      collection: Restaurants,
      inversedBy: 'users',
    },
  });

  it('Should fetch Many - inversed links correctly when the field is not the first', async function () {
    const userId1 = await Users.insertAsync({
      name: 'John',
    });
    const userId2 = await Users.insertAsync({
      name: 'John',
    });

    const restaurantId = await Restaurants.insertAsync({
      name: 'Jamie Oliver',
      userIds: [userId2, userId1],
    });

    const user = await Users.createQuery({
      $filters: {
        _id: userId1,
      },
      restaurants: {
        name: 1,
      },
    }).fetchOneAsync();

    assert.isObject(user);
    assert.isArray(user.restaurants);
    assert.lengthOf(user.restaurants, 1);
  });

  it('Should fetch deeply nested fields inside links', async function () {
    const query = createQuery({
      authors: {
        posts: {
          metadata: {
            language: {
              abbr: 1,
            },
          },
        },
      },
    });

    const data = await query.fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      author.posts.forEach((post) => {
        assert.isObject(post.metadata);
        assert.isObject(post.metadata.language);
        assert.isDefined(post.metadata.language.abbr);
      });
    });
  });

  it('Should handle empty inversedBy meta unique fields', async () => {
    await ShoppingCart.removeAsync({});
    await ShoppingCart.insertAsync({
      date: new Date(),
      items: [{ title: 'Something' }],
    });

    const data = await ShoppingCart.createQuery({
      user: {
        name: 1,
      },
    }).fetchAsync();

    assert.equal(data.length, 1);
    const [cart] = data;
    assert.isUndefined(cart.user);
  });

  it('Should remove link storage inversedBy meta unique fields', async () => {
    await ShoppingCart.removeAsync({});
    const cartId = await ShoppingCart.insertAsync({
      date: new Date(),
      items: [{ title: 'Something' }],
    });

    await Clients.removeAsync({});
    await Clients.insertAsync({
      name: 'John',
      shoppingCartData: {
        prime: 1,
        _id: cartId,
      },
    });

    const data = await ShoppingCart.createQuery({
      user: {
        name: 1,
      },
    }).fetchAsync();

    assert.equal(data.length, 1);
    const [cart] = data;
    assert.isObject(cart.user);
    assert.isString(cart.user.name);
    // no link storage
    assert.isUndefined(cart.user.shoppingCartData);
  });

  it('Should remove link storage inversedBy meta many fields', async () => {
    await ShoppingCart.removeAsync({});
    const cartId = await ShoppingCart.insertAsync({
      date: new Date(),
      items: [{ title: 'Something' }],
    });

    await Clients.removeAsync({});
    await Clients.insertAsync({
      name: 'John',
      shoppingCartsData: [
        {
          prime: 1,
          _id: cartId,
        },
      ],
    });

    const data = await ShoppingCart.createQuery({
      users: {
        name: 1,
      },
    }).fetchAsync();

    assert.equal(data.length, 1);
    const [cart] = data;
    assert.isArray(cart.users);
    assert.equal(cart.users.length, 1);
    const [user] = cart.users;
    assert.isString(user.name);
    // no link storage
    assert.isUndefined(user.shoppingCartsData);
  });

  it('Should be able to work with custom $filter function and using $and', async () => {
    await ShoppingCart.removeAsync({});
    await ShoppingCart.insertAsync({ value: 1 });
    await ShoppingCart.insertAsync({ value: 2 });
    await ShoppingCart.insertAsync({ value: 3 });
    await ShoppingCart.insertAsync({ value: 4 });

    const data = await ShoppingCart.createQuery(
      {
        $filter({ filters, params }) {
          let $or = [];
          params.values.forEach((v) => $or.push({ value: v }));

          filters.$or = $or;
        },
      },
      {
        params: {
          values: [1, 2],
        },
      },
    ).fetchAsync();

    assert.lengthOf(data, 2);
  });

  it('$filter should work with Date objects when filtering linked items', async () => {
    const CartItems = new Mongo.Collection(`CartItems`);
    CartItems.addLinks({
      shoppingCart: {
        type: 'one',
        collection: ShoppingCart,
        field: 'shoppingCartId',
      },
    });
    ShoppingCart.addLinks({
      items: {
        collection: CartItems,
        inversedBy: 'shoppingCart',
      },
    });
    await ShoppingCart.removeAsync({});
    const cartId = await ShoppingCart.insertAsync({
      value: 1,
    });
    await CartItems.insertAsync({
      createdAt: new Date('2010-01-01T00:00:00'),
      shoppingCartId: cartId,
      name: 'item1',
    });
    await CartItems.insertAsync({
      createdAt: new Date('2019-08-25T00:00:00'),
      shoppingCartId: cartId,
      name: 'item2',
    });

    const data = await ShoppingCart.createQuery({
      value: 1,
      items: {
        $filter({ filters, params }) {
          filters.createdAt = {
            $gte: new Date('2019-01-01T00:00:00'),
            $lte: new Date('2019-12-31T23:59:59'),
          };
        },
        name: 1,
      },
    }).fetchAsync();
    assert.lengthOf(data, 1);
    assert.lengthOf(data[0].items, 1);
    assert.equal(data[0].items[0].name, 'item2');
  });

  it('It should not crash when links do not exist', async () => {
    const id = `shouldNotCrash_${Random.id()}`;
    const A = new Mongo.Collection(`${id}_a`);
    const B = new Mongo.Collection(`${id}_b`);
    const C = new Mongo.Collection(`${id}_c`);

    A.addLinks({
      b: {
        field: 'bLinks',
        collection: B,
        type: 'many',
        metadata: true,
      },
    });

    C.addLinks({
      b: {
        field: 'bLinks',
        collection: B,
        type: 'many',
        metadata: true,
      },
    });

    B.addLinks({
      a: {
        collection: A,
        inversedBy: 'b',
      },
      c: {
        collection: C,
        inversedBy: 'b',
      },
    });

    const bId = await B.insertAsync({});
    const cId = await C.insertAsync({
      bLinks: [{ _id: 'unknownId' }, { _id: bId }],
    });

    const result = await C.createQuery({
      b: {
        a: {
          _id: 1,
        },
      },
    }).fetchOneAsync(); // Throws, because there is no "b" with _id 'unknownId'

    expect(result).to.not.equal(undefined);
  });

  it('Should work with links on nested fields - one', async () => {
    const result = await Files.createQuery({
      filename: 1,
      meta: 1,
      project: {
        name: 1,
      },
      // todo:
      // Put the meta: 1 here below project and meta.projectId will be cleared. This is because
      // _shouldCleanStorage processes project fieldNode before meta fieldNode.
      // Problem is manifested in collectionNode.js hasField when iterating over this.fieldNodes
      // Potential solution is to process field nodes first and then linkers and reducers
    }).fetchOneAsync();

    expect(result).to.be.an('object');
    expect(result.project).to.be.an('object');
    expect(result.project.name).to.be.equal('Project 1');
    expect(result.meta).to.be.an('object');
    expect(result.meta.type).to.be.equal('text');
    expect(result.meta.projectId).to.be.a('string');
  });

  it('Should work with links on nested fields - one (w/o meta)', async () => {
    const result = await Files.createQuery({
      filename: 1,
      project: {
        name: 1,
      },
    }).fetchOneAsync();

    expect(result).to.be.an('object');
    expect(result.meta).to.be.eql({}); // {} - not yet supporting clearing of empty storage
  });

  it('Should work with links on nested fields - one inversed', async () => {
    const result = await Projects.createQuery({
      $filters: {
        name: 'Project 1',
      },
      name: 1,
      files: {
        filename: 1,
        meta: 1,
      },
    }).fetchOneAsync();

    expect(result).to.be.an('object');
    expect(result.files).to.be.an('array');
    expect(result.files).to.have.length(2);
    result.files.forEach((file) => {
      expect(file._id).to.be.a('string');
      expect(file.filename).to.be.a('string');
      expect(file.meta).to.be.an('object');
      expect(_.keys(file.meta)).to.be.eql(['type', 'projectId']);
    });
  });

  it('Should work with links on nested fields - many', async () => {
    const result = await Files.createQuery({
      filename: 1,
      metas: 1,
      projects: {
        name: 1,
      },
      // todo: see comment for meta: 1 above
    }).fetchAsync();

    expect(result).to.be.an('array');
    expect(result).to.have.length(2);

    const [res1, res2] = result;

    expect(res1.projects).to.be.an('array');
    expect(res1.projects).to.have.length(2);

    const [project1, project2] = res1.projects;
    expect(project1.name).to.be.equal('Project 1');
    expect(project2.name).to.be.equal('Project 2');
    expect(res1.metas).to.be.an('array');
    expect(_.keys(res1.metas[0])).to.be.eql(['type', 'projectId']);

    expect(res2.projects).to.be.an('array');
    expect(res2.projects).to.have.length(1);
    expect(res2.metas).to.be.an('array');
    expect(_.keys(res2.metas[0])).to.be.eql(['type', 'projectId']);

    const [project] = res2.projects;
    expect(project.name).to.be.equal('Project 2');
  });

  it('Should work with links on nested fields - many (w/o metas)', async () => {
    const result = await Files.createQuery({
      filename: 1,
      projects: {
        name: 1,
      },
    }).fetchAsync();

    expect(result).to.be.an('array');
    expect(result).to.have.length(2);

    const [res1, res2] = result;
    expect(res1.metas).to.be.eql([{}, {}]);
    expect(res2.metas).to.be.eql([{}]);
  });

  it('Should work with links on nested fields - many inversed', async () => {
    const result = await Projects.createQuery({
      filename: 1,
      filesMany: {
        filename: 1,
        metas: 1,
        // todo:
        // Unrelated to nested fields probably
        // Try metas: {type: 1} and the returned results will be metas: {type: [....]}
        // Problem is in buildAggregatePipeline and snapBackDottedFields
      },
    }).fetchAsync();

    expect(result).to.be.an('array');
    expect(result).to.have.length(2);

    const [res1, res2] = result;

    expect(res1.filesMany).to.be.an('array');
    expect(res1.filesMany).to.have.length(1);
    const [file] = res1.filesMany;
    expect(file.filename).to.be.equal('test.txt');

    expect(res2.filesMany).to.be.an('array');
    expect(res2.filesMany).to.have.length(2);

    const [file1, file2] = res2.filesMany;
    expect(file1.filename).to.be.a('string');
    expect(file2.filename).to.be.a('string');
  });
});

describe('intersectDeep', () => {
  it('works - keeps $filter and does not include client fields', () => {
    const allowedBody = {
      $filter() {},
      $options: {},
      name: 1,
      dob: 1,
    };

    const res = intersectDeep(allowedBody, { name: 1, salary: 1 });

    expect(res).to.be.an('object');
    expect(res.name).to.be.equal(1);
    expect(res.dob).to.be.undefined;
    expect(res.salary).to.be.undefined;
    expect(res.$filter).to.be.equal(allowedBody.$filter);
    expect(res.$options).to.be.equal(allowedBody.$options);
  });

  it('works - ignores client special fields', () => {
    const allowedBody = {
      $filter() {},
      name: 1,
      dob: 1,
    };

    const clientBody = {
      $paginate: true,
      $filters: {},
      $filter() {},
      $options: {},

      name: 1,
    };

    const res = intersectDeep(allowedBody, clientBody);

    expect(res).to.be.an('object');
    expect(res.name).to.be.equal(1);
    expect(res.$filter).to.be.equal(allowedBody.$filter); // not from clientBody
    expect(res.$filters).to.be.undefined;
    expect(res.$paginate).to.be.undefined;
    expect(res.$options).to.be.undefined;
  });

  it('works - with nested fields 1', () => {
    const allowedBody = {
      nested: 1,
    };

    const clientBody = {
      nested: {
        title: 1,
      },
    };

    const res = intersectDeep(allowedBody, clientBody);
    expect(res.nested).to.be.eql({ title: 1 });
  });

  it('works - with nested fields 2', () => {
    const allowedBody = {
      nested: {
        title: 1,
        date: 1,
      },
    };

    const clientBody = {
      nested: 1,
    };

    const res = intersectDeep(allowedBody, clientBody);
    expect(res.nested).to.be.eql({ title: 1, date: 1 });
  });

  it('works - with nested fields 3 (clearing)', () => {
    const allowedBody = {
      nested: {
        title: 1,
        date: 1,
      },
    };

    const clientBody = {
      nested: {
        nothing: 1,
      },
    };

    const res = intersectDeep(allowedBody, clientBody);
    expect(res.nested).to.be.eql({});
  });

  it('works - with nested fields 3 (clearing)', () => {
    const allowedBody = {
      nested: {
        title: 1,
        date: 1,
      },
    };

    const clientBody = {
      nested: {
        nothing: 1,
      },
    };

    const res = intersectDeep(allowedBody, clientBody);
    expect(res.nested).to.be.eql({});
  });

  it('validity checks', () => {
    const allowedBody = {
      title: 1,
    };

    const clientBody = {
      title: 'bla',
    };

    const res = intersectDeep(allowedBody, clientBody);
    expect(res).to.be.eql({});
  });

  it('deep reducer test', async () => {
    const A = new Mongo.Collection(Random.id());

    A.addReducers({
      reducer: {
        body: {
          field: {
            main: { min: { a: 1, b: 1 }, max: { a: 1, b: 1 } },
            second: { min: { a: 1, b: 1 }, max: { a: 1, b: 1 } },
          },
        },
        reduce: () => {
          return 'hello';
        },
      },
    });

    await A.insertAsync({
      field: {
        main: { min: { a: 1, b: 2 }, max: { a: 1, b: 2 } },
        second: { min: { a: 1, b: 2 }, max: { a: 1, b: 2 } },
      },
    });

    const result = await A.createQuery({
      field: { main: { min: { a: 1 }, max: 1 } },
      reducer: 1,
    }).fetchAsync();

    expect(result[0].field.main.min).to.not.equal(undefined);
    expect(result[0].field.main.max).to.not.equal(undefined); // fails!
  });

  // TODO(v3): denormalize
  it.skip('$filters behavior different for many-meta-inversed link', async () => {
    const A = new Mongo.Collection(Random.id());
    const B = new Mongo.Collection(Random.id());
    A.addLinks({
      b: {
        field: 'bLinks',
        collection: B,
        type: 'many',
        metadata: true,
      },
    });

    B.addLinks({
      a: {
        collection: A,
        inversedBy: 'b',
        type: 'many',
        denormalize: {
          field: 'aCache',
          body: { _id: 1, title: 1 },
        },
      },
    });
    const bId = await B.insertAsync({});

    const aId1 = await A.insertAsync({
      _id: 'aId1',
      title: 'A1',
      category: 1,
      bLinks: [{ _id: bId }],
    });

    const aId2 = await A.insertAsync({
      _id: 'aId2',
      title: 'A2',
      category: 2,
      bLinks: [{ _id: bId }],
    });

    const aId3 = await A.insertAsync({
      _id: 'aId3',
      title: 'A3',
      category: 2,
      bLinks: [{ _id: bId }],
    });

    // expect(A.createQuery({}).fetch().length).to.equal(3);

    // expect(
    //     A.createQuery({ $filters: { category: 2 } }).fetch().length
    // ).to.equal(2);

    // expect(
    //     A.createQuery({ $filters: { category: undefined } }).fetch().length
    // ).to.equal(3);

    // const b1 = B.createQuery({
    //     a: { category: 1 }
    // }).fetchOne();
    // expect(b1.a.length).to.equal(3);

    // const b2 = B.createQuery({
    //     a: { category: 1, $filters: { category: 2 } }
    // }).fetchOne();
    // expect(b2.a.length).to.equal(2);

    let $filters = { category: undefined };

    const b3 = await B.createQuery({
      a: { title: 1, $filters },
    }).fetchOneAsync();
    expect(b3.a.length).to.equal(3); // This returns 0, but should be 3
  });

  it('It should work with reverted link and objects inside array', async () => {
    const A = new Mongo.Collection(Random.id());
    const B = new Mongo.Collection(Random.id());
    A.addLinks({
      b: {
        field: 'bId',
        collection: B,
      },
    });

    B.addLinks({
      a: {
        collection: A,
        inversedBy: 'b',
      },
    });
    const bId = await B.insertAsync({});

    const aId1 = await A.insertAsync({
      _id: 'aId1',
      title: 'A1',
      bId,
      ratings: [
        {
          rating: 1,
          dimension: '1',
        },
        {
          rating: 2,
          dimension: '2',
        },
      ],
    });

    const bObj = await B.createQuery({
      a: {
        ratings: {
          rating: 1,
          dimension: 1,
        },
      },
    }).fetchOneAsync();

    assert.isObject(bObj);
    assert.isArray(bObj.a);
    assert.isArray(bObj.a[0].ratings);

    bObj.a[0].ratings.forEach((r) => {
      assert.isString(r.dimension);
      assert.isNumber(r.rating);
    });
  });
});

describe('collection transforms', () => {
  const TransformA = new Mongo.Collection('transformA', {
    transform: (doc) => ({ ...doc, hello: 'world1' }),
  });
  const TransformB = new Mongo.Collection('transformB', {
    transform: (doc) => ({ ...doc, hello: 'world2' }),
  });

  TransformA.addLinks({
    b: {
      collection: TransformB,
      field: 'bLink',
      type: 'one',
    },
  });

  TransformB.addLinks({
    a: {
      collection: TransformA,
      inversedBy: 'b',
    },
  });

  beforeEach(async () => {
    await TransformA.removeAsync({});
    await TransformB.removeAsync({});
    const b = await TransformB.insertAsync({ value: 1 });
    const a1 = await TransformA.insertAsync({ value: 1, bLink: b });
    const a2 = await TransformA.insertAsync({ value: 2, bLink: b });
  });

  it('Should apply transforms on direct side', async () => {
    const result = await createQuery({
      transformB: {
        value: 1,
        a: { value: 1 },
      },
    }).fetchOneAsync();

    expect(result.hello).to.equal('world2');
    expect(result.a[0].hello).to.equal('world1');
    expect(result.a[1].hello).to.equal('world1');
  });

  it('Should apply transforms on indirect side', async () => {
    const [result1, result2] = await createQuery({
      transformA: {
        value: 1,
        b: { value: 1 },
      },
    }).fetchAsync();

    expect(result1.hello).to.equal('world1');
    expect(result1.b.hello).to.equal('world2');
    expect(result2.hello).to.equal('world1');
    expect(result2.b.hello).to.equal('world2');
  });

  it('Should apply transforms in a nested way', async () => {
    const result = await createQuery({
      transformA: {
        value: 1,
        b: { value: 1, a: { value: 1, b: { value: 1 } } },
      },
    }).fetchOneAsync();

    expect(result.hello).to.equal('world1');
    expect(result.b.hello).to.equal('world2');
    expect(result.b.a[0].hello).to.equal('world1');
    expect(result.b.a[1].hello).to.equal('world1');
    expect(result.b.a[0].b.hello).to.equal('world2');
  });
});
