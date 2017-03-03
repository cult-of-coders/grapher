import { createQuery } from 'meteor/cultofcoders:grapher';
import './units/deepClone';
import './reducers.client.test';
import './security.client.test';
import waitForHandleToBeReady from './lib/waitForHandleToBeReady';

describe('Query Client Tests', function () {
    it('Should work with queries via method call', function (done) {
        const query = createQuery({
            posts: {
                $options: {limit: 5},
                title: 1,
                comments: {
                    $filters: {text: 'Good'},
                    text: 1
                }
            }
        });

        query.fetch((err, res) => {
            assert.isUndefined(err);

            assert.isArray(res);
            _.each(res, post => {
                assert.isString(post.title);
                assert.isString(post._id);
                _.each(post.comments, comment => {
                    assert.isString(comment._id);
                    assert.equal('Good', comment.text);
                })
            });

            done();
        });
    });

    it('Should work with queries reactively', function (done) {
        const query = createQuery({
            posts: {
                $options: {limit: 5},
                title: 1,
                comments: {
                    $filters: {text: 'Good'},
                    text: 1
                }
            }
        });

        const handle = query.subscribe();

        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();

                const res = query.fetch();

                assert.isArray(res);
                _.each(res, post => {
                    assert.isString(post.title);
                    assert.isString(post._id);
                    _.each(post.comments, comment => {
                        assert.isString(comment._id);
                        assert.equal('Good', comment.text);
                    })
                });

                handle.stop();
                done();
            }
        })
    });


    it('Should fetch direct One links with $metadata via Subscription', function (done) {
        let query = createQuery({
            posts: {
                group: {
                    name: 1
                }
            }
        });

        let handle = query.subscribe();
        Tracker.autorun((c) => {
            if (handle.ready()) {
                c.stop();
                let data = query.fetch();

                handle.stop();

                _.each(data, post => {
                    assert.isObject(post.group.$metadata);
                    assert.isDefined(post.group.$metadata.random);
                });

                done();
            }
        })
    });

    it('Should fetch direct Many links with $metadata via Subscription', function (done) {
        let query = createQuery({
            authors: {
                groups: {
                    $options: {limit: 1},
                    name: 1
                }
            }
        });

        let handle = query.subscribe();
        Tracker.autorun((c) => {
            if (handle.ready()) {
                c.stop();
                let data = query.fetch();

                handle.stop();

                _.each(data, author => {
                    assert.isArray(author.groups);

                    _.each(author.groups, group => {
                        assert.isObject(group.$metadata);
                    })
                })

                done();
            }
        })
    });

    it('Should fetch Inversed One Meta links with $metadata via Subscription', function (done) {
        let query = createQuery({
            groups: {
                posts: {
                    title: 1
                }
            }
        });

        let handle = query.subscribe();

        Tracker.autorun((c) => {
            if (handle.ready()) {
                c.stop();

                let data = query.fetch();
                handle.stop();

                _.each(data, group => {
                    _.each(group.posts, post => {
                        assert.isObject(post.$metadata);
                        assert.isDefined(post.$metadata.random);
                    })
                });


                done();
            }
        });
    });

    it('Should fetch Inversed Many Meta links with $metadata via Subscription', function (done) {
        let query = createQuery({
            groups: {
                authors: {
                    $options: {limit: 1},
                    name: 1
                }
            }
        });

        let handle = query.subscribe();

        Tracker.autorun((c) => {
            if (handle.ready()) {
                c.stop();

                let data = query.fetch();

                _.each(data, group => {
                    _.each(group.authors, author => {
                        assert.isObject(author.$metadata);
                    });
                });

                done();
                handle.stop();
            }
        });
    });

    it('Should work with promises', async function () {
        let query = createQuery({
            groups: {
                posts: {
                    title: 1
                }
            }
        });

        let result = await query.fetchSync();

        assert.isArray(result);
        assert.isTrue(result.length > 0);
        result.forEach(item => {
            assert.isArray(item.posts);
            assert.isTrue(item.posts.length > 0);
        });

        result = await query.fetchOneSync();

        assert.isObject(result);
        assert.isString(result._id);
        assert.isArray(result.posts);

        result = await query.getCountSync();

        assert.isNumber(result);
    });

    it('Should work with fetchOne', async function (done) {
        let query = createQuery({
            groups: {
                posts: {
                    title: 1
                }
            }
        });

        query.fetchOne((err, group) => {
            assert.isNotArray(group);
            assert.isObject(group);
            assert.isArray(group.posts);

            done();
        })
    })

    it('Should work sorting with options that contain a dot', function () {
        let query = createQuery({
            posts: {
                author: {
                    $filter({options}) {
                        options.sort = {
                            'profile.firstName': 1
                        }
                    },
                    profile: 1,
                }
            }
        });

        query.fetch((err, data) => {
            assert.isArray(data);
        })
    });

    it('Should properly clone and work with setParams', function () {
        let query = createQuery({
            posts: {
                $options: {limit: 5}
            }
        });

        let clone = query.clone({});

        assert.isFunction(clone.fetch);
        assert.isFunction(clone.fetchOne);
        assert.isFunction(clone.setParams);
        assert.isFunction(clone.setParams({}).fetchOne);
    });

    it('Should work securely with reactive queries and linked exposures', function () {

    })
});
