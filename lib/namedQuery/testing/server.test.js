import { assert } from 'chai';
import {
    postList,
    postListCached,
    postListResolver,
    postListResolverCached,
    postListParamsCheck,
    postListParamsCheckServer,
} from './bootstrap/queries';
import { createQuery, NamedQuery } from 'meteor/cultofcoders:grapher';

describe('Named Query', function () {
    it('Should return the proper values', function () {
        const createdQuery = createQuery({
            postList: {
                title: 'User Post - 3'
            }
        });

        const directQuery = postList.clone({
            title: 'User Post - 3'
        });

        _.each([createdQuery, directQuery], (query) => {
            const data = query.fetch();

            assert.isTrue(data.length > 1);

            _.each(data, post => {
                assert.equal(post.title, 'User Post - 3');
                assert.isObject(post.author);
                assert.isObject(post.group);
            })
        })
    });

    it('Exposure embodyment should work properly', function () {
        const query = createQuery({
            postListExposure: {
                title: 'User Post - 3'
            }
        });

        const data = query.fetch();

        assert.isTrue(data.length > 1);

        _.each(data, post => {
            assert.equal(post.title, 'User Post - 3');
            assert.isObject(post.author);
            assert.isObject(post.group);
        })
    });

    it('Should properly cache the values', function (done) {
        const posts = postListCached.fetch();
        const postsCount = postListCached.getCount();

        const Posts = Mongo.Collection.get('posts');
        const postId = Posts.insert({title: 'Hello Cacher!'});

        assert.equal(posts.length, postListCached.fetch().length);
        assert.equal(postsCount, postListCached.getCount());

        Meteor.setTimeout(function () {
            const newPosts = postListCached.fetch();
            const newCount = postListCached.getCount();

            Posts.remove(postId);

            assert.isArray(newPosts);
            assert.isNumber(newCount);

            assert.equal(posts.length + 1, newPosts.length);
            assert.equal(postsCount + 1, newCount);

            done();
        }, 400)
    });

    it('Should allow to securely fetch a subbody of a namedQuery including embodiment', function () {
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
                    }
                }
            }
        });

        const data = query.fetch();

        assert.isTrue(data.length > 0);

        _.each(data, post => {
            assert.equal(post.title, 'User Post - 3');
            assert.isUndefined(post.createdAt);
            assert.isUndefined(post.author);
            assert.isObject(post.group);
            assert.isUndefined(post.group.createdAt);
        })
    });

    it('Should work with resolver() queries with params', function () {
        const title = 'User Post - 3';
        const createdQuery = createQuery({
            postListResolver: {
                title
            }
        });

        const directQuery = postListResolver.clone({
            title
        });

        let data = createdQuery.fetch();
        assert.isArray(data);
        assert.equal(title, data[0]);


        data = directQuery.fetch();
        assert.isArray(data);
        assert.equal(title, data[0]);
    });

    it('Should work with resolver() that is cached', function () {
        const title = 'User Post - 3';
        let data = postListResolverCached.clone({title}).fetch();

        assert.isArray(data);
        assert.equal(title, data[0]);

        data = postListResolverCached.clone({title}).fetch();

        assert.isArray(data);
        assert.equal(title, data[0]);
    });

    it('Should work with resolver() that has params validation', function (done) {
        try {
            postListParamsCheck.clone({}).fetch();
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
        NamedQuery.setConfig({scoped: true});
        try {
            const query = createQuery('_namedQuery', {
                posts: {
                    title: 1,
                },
            });

            assert.isTrue(query.options.scoped);
        }
        finally {
            NamedQuery.setConfig({});
        }
    });
});
