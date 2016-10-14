import { createQuery } from 'meteor/cultofcoders:grapher';
import './units/deepClone';

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
});