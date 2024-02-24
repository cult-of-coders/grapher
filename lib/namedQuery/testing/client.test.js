import { assert, expect } from 'chai';
import postListExposure, {
  postListFilteredWithDate,
} from './bootstrap/queries/postListExposure.js';
import postListExposureScoped from './bootstrap/queries/postListExposureScoped';
import userListScoped from './bootstrap/queries/userListScoped';
import productsList from './bootstrap/queries/productsList';
import { createQuery } from 'meteor/cultofcoders:grapher';
import Posts from '../../query/testing/bootstrap/posts/collection';
import Users from '../../query/testing/bootstrap/users/collection';
import { _ } from 'meteor/underscore';

describe('Named Query', function () {
  it('Should return proper values', function (done) {
    const query = createQuery({
      postListExposure: {
        title: 'User Post - 3',
      },
    });

    query.fetch((err, res) => {
      assert.isUndefined(err);
      assert.isTrue(res.length > 0);

      _.each(res, (post) => {
        assert.equal(post.title, 'User Post - 3');
        assert.isObject(post.author);
        assert.isObject(post.group);
      });

      done();
    });
  });

  it('Should return proper values using query directly via import', function (done) {
    const query = postListExposure.clone({ title: 'User Post - 3' });

    query.fetch((err, res) => {
      assert.isUndefined(err);
      assert.isTrue(res.length > 0);

      _.each(res, (post) => {
        assert.equal(post.title, 'User Post - 3');
        assert.isObject(post.author);
        assert.isObject(post.group);
      });

      done();
    });
  });

  it('Should return proper values using query directly via import - sync', async function () {
    const query = postListExposure.clone({ title: 'User Post - 3' });

    const res = await query.fetchSync();

    assert.isTrue(res.length > 0);

    _.each(res, (post) => {
      assert.equal(post.title, 'User Post - 3');
      assert.isObject(post.author);
      assert.isObject(post.group);
    });
  });

  it('Should work with count', function (done) {
    const query = postListExposure.clone({ title: 'User Post - 3' });

    query.getCount((err, res) => {
      assert.equal(6, res);
      done();
    });
  });

  it('Should work with count when filtering on dates', function (done) {
    const query = postListFilteredWithDate.clone({ date: new Date() });

    query.getCount((err, res) => {
      assert.equal(36, res);
      done();
    });
  });

  it('Should work with count - sync', async function () {
    const query = postListExposure.clone({ title: 'User Post - 3' });

    const count = await query.getCountSync();
    assert.equal(6, count);
  });

  it('Should work with count - sync when filtering on dates', async function () {
    const query = postListFilteredWithDate.clone({ date: new Date() });

    const count = await query.getCountSync();
    assert.equal(36, count);
  });

  it('Should work with reactive counts', function (done) {
    const query = postListExposure.clone({ title: 'User Post - 3' });

    const handle = query.subscribeCount();
    Tracker.autorun((c) => {
      if (handle.ready()) {
        c.stop();
        const count = query.getCount();
        handle.stop();

        assert.equal(count, 6);
        done();
      }
    });
  });
  it('Should work with reactive counts when filtering ondates', function (done) {
    const query = postListFilteredWithDate.clone({ date: new Date() });

    const handle = query.subscribe();
    const handleCount = query.subscribeCount();
    Tracker.autorun((c) => {
      if (handle.ready() && handleCount.ready()) {
        c.stop();
        const count = query.getCount();
        const data = query.fetch();
        handle.stop();
        handleCount.stop();
        assert.equal(data.length, 36);
        assert.equal(count, 36);
        done();
      }
    });
  });

  it('Should work with reactive queries', function (done) {
    const query = createQuery({
      postListExposure: {
        title: 'User Post - 3',
      },
    });

    const handle = query.subscribe();

    Tracker.autorun((c) => {
      if (handle.ready()) {
        c.stop();
        const res = query.fetch();
        handle.stop();

        assert.isTrue(res.length > 0);

        _.each(res, (post) => {
          assert.equal(post.title, 'User Post - 3');
          assert.isObject(post.author);
          assert.isObject(post.group);
        });

        done();
      }
    });
  });

  // TODO(v3): scoped queries
  it.skip('Should work with reactive scoped queries', function (done) {
    const query = postListExposureScoped.clone({ title: 'User Post - 3' });

    const handle = query.subscribe();
    Tracker.autorun((c) => {
      if (handle.ready()) {
        c.stop();
        const data = query.fetch();
        handle.stop();

        assert.isTrue(data.length > 0);

        // swap this over to an object
        // since in 2.5+ an actual Map is used
        const postDocs = Posts._collection._docs._map;
        const docMap =
          postDocs instanceof Map ? Object.fromEntries(postDocs) : postDocs;

        const scopeField = `_sub_${handle.subscriptionId}`;
        const queryPathField = '_query_path_posts';
        data.forEach((post) => {
          // no scope field returned from find
          assert.isUndefined(post[scopeField]);
          assert.isObject(docMap[post._id]);
          assert.equal(docMap[post._id][scopeField], 1);
          assert.equal(docMap[post._id][queryPathField], 1);
        });

        done();
      }
    });
  });

  // TODO(v3): scoped queries
  it.skip('Should work with reactive recursive scoped queries', function (done) {
    const query = userListScoped.clone({ name: 'User - 3' });

    const handle = query.subscribe();
    Tracker.autorun((c) => {
      if (handle.ready()) {
        c.stop();
        const data = query.fetch();
        handle.stop();

        assert.equal(data.length, 1);
        // User 3 has users 0,1,2 as friends and user 2 as subordinate
        const [user3] = data;
        assert.equal(user3.friends.length, 3);

        // swap this over to an object
        // since in 2.5+ an actual Map is used
        const userDocs = Users._collection._docs._map;
        const docMap =
          userDocs instanceof Map ? Object.fromEntries(userDocs) : userDocs;
        // users collection on the client should have 4 items (user 3 and friends - user 0,1,2)
        assert.equal(_.keys(docMap).length, 4);

        const scopeField = `_sub_${handle.subscriptionId}`;
        const rootQueryPathField = '_query_path_users';
        const friendsQueryPathField = '_query_path_users_friends';
        const adversaryQueryPathField = '_query_path_users_subordinates';
        Object.entries(docMap).forEach(([userId, userDoc]) => {
          const isRoot = userId === user3._id;
          assert.equal(userDoc[scopeField], 1);
          if (isRoot) {
            assert.equal(userDoc[rootQueryPathField], 1);
            assert.isTrue(!(friendsQueryPathField in userDoc));
            assert.isTrue(!(adversaryQueryPathField in userDoc));
          } else {
            assert.equal(userDoc[friendsQueryPathField], 1);
            assert.isTrue(!(rootQueryPathField in userDoc));

            if (userDoc.name === 'User - 2') {
              assert.equal(userDoc[adversaryQueryPathField], 1);
            } else {
              assert.isTrue(!(adversaryQueryPathField in userDoc));
            }
          }
        });

        done();
      }
    });
  });

  it('Should work with reactive queries via import', function (done) {
    const query = postListExposure.clone({
      title: 'User Post - 3',
    });

    const handle = query.subscribe();

    Tracker.autorun((c) => {
      if (handle.ready()) {
        c.stop();
        const res = query.fetch();
        handle.stop();

        assert.isTrue(res.length > 0);

        _.each(res, (post) => {
          assert.equal(post.title, 'User Post - 3');
          assert.isObject(post.author);
          assert.isObject(post.group);
        });

        done();
      }
    });
  });

  it('Should work with reactive queries containing link with foreignIdentityField', function (done) {
    const query = productsList.clone({
      filters: {
        // only considering products with productId
        productId: { $ne: null },
      },
    });

    const handle = query.subscribe();

    Tracker.autorun((c) => {
      if (handle.ready()) {
        c.stop();
        const res = query.fetch();
        handle.stop();

        assert.equal(res.length, 3);

        const [nails1, nails2, laptop] = res;
        assert.equal(nails1.price, 1.5);
        assert.lengthOf(nails1.attributes, 1);
        assert.deepEqual(nails1.attributes[0].unit, 'piece');
        assert.deepEqual(nails1.attributes[0].delivery, 0);

        assert.equal(nails2.price, 1.6);
        assert.lengthOf(nails2.attributes, 1);
        assert.equal(nails2.attributes[0].unit, 'piece');
        assert.equal(nails2.attributes[0].delivery, 0);

        assert.equal(laptop.price, 1500);
        assert.lengthOf(laptop.attributes, 1);
        assert.equal(laptop.attributes[0].delivery, 10);

        done();
      }
    });
  });

  it('should work with reactive queries ', (done) => {
    const query = productsList.clone({
      filters: {
        // only considering products with productId
        singleProductId: { $ne: null },
      },
    });

    const handle = query.subscribe();

    Tracker.autorun((c) => {
      if (handle.ready()) {
        c.stop();
        const res = query.fetch();
        handle.stop();

        assert.equal(res.length, 1);

        const [laptop] = res;
        assert.isObject(laptop.singleAttribute);
        assert.equal(laptop.singleAttribute.delivery, 12);

        done();
      }
    });
  });
});
