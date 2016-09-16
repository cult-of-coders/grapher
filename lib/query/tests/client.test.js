import './bootstrap.js';
import createQuery from '../createQuery.js';

describe('Query Client Tests', function () {
    it('Should return static data with helpers', function (done) {
        const query = PostCollection.createQuery({
            title: 1,
            groups: 1
        });

        query.fetch((err, res) => {
            assert.lengthOf(res, 2);
            _.each(res, element => {
                assert.isArray(element.groups);
            });

            done();
        });
    });

    it('Should work with global queries', function (done) {
        const query = createQuery({
            test_query_post: {
                title: 1,
                groups: 1
            }
        });

        query.fetch((err, res) => {
            assert.lengthOf(res, 2);
            _.each(res, element => {
                assert.isArray(element.groups);
            });

            done();
        });
    });

    it('Should work with global queries (reactively)', function (done) {
        const query = createQuery({
            test_query_post: {
                title: 1,
                groups: 1
            }
        });

        const handle = query.subscribe();

        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();

                const res = query.fetch();

                assert.lengthOf(res, 2);
                _.each(res, element => {
                    assert.isArray(element.groups);
                });

                done();
            }
        })
    });

    it('Should subscribe to links properly', function (done) {
        const query = PostCollection.createQuery({
            title: 1,
            comments: {
                $filters: {isBanned: false}
            },
            groups: {}
        });

        const subsHandle = query.subscribe();

        Tracker.autorun((c) => {
            if (subsHandle.ready()) {
                c.stop();

                let posts = PostCollection.find().fetch();
                assert.lengthOf(posts, 2);
                let firstPost = posts[0];

                const commentsLink = PostCollection.getLink(firstPost, 'comments');
                assert.lengthOf(commentsLink.find().fetch(), 2);

                // check direct fetching
                posts = query.fetch();

                assert.lengthOf(posts, 2);
                firstPost = posts[0];
                assert.lengthOf(firstPost.comments, 2);

                done();
            }
        })
    });
});