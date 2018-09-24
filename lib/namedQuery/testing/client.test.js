import postListExposure from './bootstrap/queries/postListExposure.js';
import postListExposureScoped from './bootstrap/queries/postListExposureScoped';
import { createQuery } from 'meteor/cultofcoders:grapher';
import Posts from '../../query/testing/bootstrap/posts/collection';

describe('Named Query', function() {
    it('Should return proper values', function(done) {
        const query = createQuery({
            postListExposure: {
                title: 'User Post - 3',
            },
        });

        query.fetch((err, res) => {
            assert.isUndefined(err);
            assert.isTrue(res.length > 0);

            _.each(res, post => {
                assert.equal(post.title, 'User Post - 3');
                assert.isObject(post.author);
                assert.isObject(post.group);
            });

            done();
        });
    });

    it('Should return proper values using query directly via import', function(done) {
        const query = postListExposure.clone({ title: 'User Post - 3' });

        query.fetch((err, res) => {
            assert.isUndefined(err);
            assert.isTrue(res.length > 0);

            _.each(res, post => {
                assert.equal(post.title, 'User Post - 3');
                assert.isObject(post.author);
                assert.isObject(post.group);
            });

            done();
        });
    });

    it('Should return proper values using query directly via import - sync', async function() {
        const query = postListExposure.clone({ title: 'User Post - 3' });

        const res = await query.fetchSync();

        assert.isTrue(res.length > 0);

        _.each(res, post => {
            assert.equal(post.title, 'User Post - 3');
            assert.isObject(post.author);
            assert.isObject(post.group);
        });
    });

    it('Should work with count', function(done) {
        const query = postListExposure.clone({ title: 'User Post - 3' });

        query.getCount((err, res) => {
            assert.equal(6, res);
            done();
        });
    });

    it('Should work with count - sync', async function() {
        const query = postListExposure.clone({ title: 'User Post - 3' });

        const count = await query.getCountSync();
        assert.equal(6, count);
    });

    it('Should work with reactive counts', function(done) {
        const query = postListExposure.clone({ title: 'User Post - 3' });

        const handle = query.subscribeCount();
        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();
                const count = query.getCount();
                handle.stop();

                assert.equal(count, 6);
                done();
            }
        });
    });

    it('Should work with reactive queries', function(done) {
        const query = createQuery({
            postListExposure: {
                title: 'User Post - 3',
            },
        });

        const handle = query.subscribe();

        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();
                const res = query.fetch();
                handle.stop();

                assert.isTrue(res.length > 0);

                _.each(res, post => {
                    assert.equal(post.title, 'User Post - 3');
                    assert.isObject(post.author);
                    assert.isObject(post.group);
                });

                done();
            }
        });
    });

    it('Should work with reactive scoped queries', function(done) {
        const query = postListExposureScoped.clone({ title: 'User Post - 3' });

        const handle = query.subscribe();
        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();
                const data = query.fetch();
                handle.stop();

                assert.isTrue(data.length > 0);

                const docMap = Posts._collection._docs._map;
                const scopeField = `_sub_${handle.subscriptionId}`;
                data.forEach(post => {
                    // no scope field returned from find
                    assert.isUndefined(post[scopeField]);
                    assert.isObject(docMap[post._id]);
                    assert.equal(docMap[post._id][scopeField], 1);
                });

                done();
            }
        });
    });

    it('Should work with reactive queries via import', function(done) {
        const query = postListExposure.clone({
            title: 'User Post - 3',
        });

        const handle = query.subscribe();

        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();
                const res = query.fetch();
                handle.stop();

                assert.isTrue(res.length > 0);

                _.each(res, post => {
                    assert.equal(post.title, 'User Post - 3');
                    assert.isObject(post.author);
                    assert.isObject(post.group);
                });

                done();
            }
        });
    });
});
