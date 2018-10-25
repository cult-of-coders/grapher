import { assert } from 'chai';
import { createQuery } from 'meteor/cultofcoders:grapher';

describe('Hypernova - $meta filters', function () {
    it('Should work with $meta filters - One Meta Direct', function () {
        const data = createQuery({
            posts: {
                group: {
                    name: 1
                }
            }
        }).fetch();

        let post = data[0];

        const random = post.group.$metadata.random;

        let posts = createQuery({
            posts: {
                $filters: {_id: post._id},
                group: {
                    $filters: {
                        $meta: {random}
                    }
                }
            }
        }).fetch();

        assert.lengthOf(posts, 1);
        assert.isObject(posts[0].group);

        posts = createQuery({
            posts: {
                $filters: {_id: post._id},
                group: {
                    $filters: {
                        $meta: {random: random + 'invalidate'}
                    }
                }
            }
        }).fetch();

        assert.lengthOf(posts, 1);
        assert.isUndefined(posts[0].group);
    });

    it('Should work with $meta filters - One Meta Virtual', function () {
        const data = createQuery({
            groups: {
                posts: {
                    name: 1
                }
            }
        }).fetch();

        let group = data[0];
        let post = group.posts[0];
        const random = post.$metadata.random;
        assert.isDefined(random);

        let groups = createQuery({
            groups: {
                $filters: {_id: group._id},
                posts: {
                    $filters: {
                        _id: post._id,
                        $meta: {random}
                    },
                    name: 1
                }
            }
        }).fetch();

        assert.lengthOf(groups, 1);
        assert.lengthOf(groups[0].posts, 1);
        assert.isObject(groups[0].posts[0].$metadata);
        assert.equal(groups[0].posts[0].$metadata.random, random);

        groups = createQuery({
            groups: {
                $filters: {_id: group._id},
                posts: {
                    $filters: {
                        _id: post._id,
                        $meta: {random: random + 'invalidate'}
                    },
                    name: 1
                }
            }
        }).fetch();

        assert.lengthOf(groups, 1);
        assert.isTrue(!groups[0].posts || groups[0].posts.length === 0);
    });

    it('Should work with $meta filters - Many Meta Direct', function () {
        let data = createQuery({
            authors: {
                name: 1,
                groups: {
                    $filters: {
                        $meta: {isAdmin: true},
                    },
                    $options: {limit: 1},
                    name: 1
                }
            }
        }).fetch();

        let assertions = 0;

        _.each(data, author => {
            _.each(author.groups, group => {
                assert.isObject(group.$metadata);
                assert.isTrue(group.$metadata.isAdmin);
                assertions++;
            })
        });

        data = createQuery({
            authors: {
                name: 1,
                groups: {
                    $filters: {
                        $meta: {isAdmin: false},
                    },
                    $options: {limit: 1},
                    name: 1
                }
            }
        }).fetch();

        _.each(data, author => {
            _.each(author.groups, group => {
                assert.isObject(group.$metadata);
                assert.isFalse(group.$metadata.isAdmin);
                assertions++;
            })
        });

        assert.isTrue(assertions > 0);
    });

    it('Should work with $meta filters - Many Meta Virtual', function () {
        let data = createQuery({
            groups: {
                name: 1,
                authors: {
                    $filters: {
                        $meta: {isAdmin: true},
                    },
                    $options: {limit: 1},
                    name: 1
                }
            }
        }).fetch();

        let assertions = 0;

        _.each(data, group => {
            _.each(group.authors, author => {
                assert.isObject(author.$metadata);
                assert.isTrue(author.$metadata.isAdmin);
                assertions++;
            })
        });

        data = createQuery({
            groups: {
                name: 1,
                authors: {
                    $filters: {
                        $meta: {isAdmin: false},
                    },
                    $options: {limit: 1},
                    name: 1
                }
            }
        }).fetch();

        _.each(data, group => {
            _.each(group.authors, author => {
                assert.isObject(author.$metadata);
                assert.isFalse(author.$metadata.isAdmin);
                assertions++;
            })
        });

        assert.isTrue(assertions > 0);
    });
});
