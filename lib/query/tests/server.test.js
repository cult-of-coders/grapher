import createQuery from '../createQuery.js';

describe('Query Server Tests', function () {
    it('should return the propper data', function () {
        const query = PostCollection.createQuery({
            $filters: {'title': 'Hello'},
            title: 1,
            author: {
                name: 1
            },
            nested: {
                data: 1
            },
            comments: {
                text: 1,
                author: {
                    name: 1
                }
            },
            groups: {
                name: 1
            },
            comment_resolve: {
                $filters: {test: '123'}
            }
        });

        const data = query.fetch();

        assert.equal(1, data.length);
        let post = data[0];

        //assert.isString(post.testModelFunction());
        assert.equal('Yes', post.nested.data);
        assert.equal(3, post.comments.length);
        assert.equal(2, post.groups.length);
        assert.isObject(post.author);
        assert.equal('John McSmithie', post.author.name);

        assert.lengthOf(post.comment_resolve, 1);

        _.each(post.comments, comment => {
            assert.isString(comment.author.name);
        })
    });

    it('should apply filter function recursively', function () {
        const query = PostCollection.createQuery({
            $filter({filters, params}) {
                if (params.title) {
                    filters.title = params.title;
                }
            }
        });

        query.setParams({title: 'Hello'});
        assert.equal(1, query.fetch().length);

        query.setParams({title: undefined});
        assert.equal(2, query.fetch().length);
    });


    it('Should work with global createQuery', function () {
        const query = createQuery({
            test_query_post: {
                title: 1,
                groups: 1
            }
        });

        const res = query.fetch();

        assert.lengthOf(res, 2);
        _.each(res, element => {
            assert.isArray(element.groups);
        });
    });

    it('Should fetch the fields properly', function () {
        let res;

        res = createQuery({
            test_query_post: {
            }
        }).fetch();
        _.each(res, element => {
            assert.isDefined(element._id);
            assert.isUndefined(element.title);
        });

        res = createQuery({
            test_query_post: {
                title: 1
            }
        }).fetch();

        _.each(res, element => {
            assert.isDefined(element._id);
            assert.isDefined(element.title);
        });

        res = createQuery({
            test_query_post: {
                groups: {
                }
            }
        }).fetch();

        _.each(res, element => {
            assert.isDefined(element._id);
            _.each(element.groups, group => {
                assert.isDefined(group._id);
                assert.isUndefined(group.name);
            })
        });

        res = createQuery({
            test_query_post: {
                $all: 1,
                groups: {
                    $all: 1
                }
            }
        }).fetch();

        _.each(res, element => {
            assert.isDefined(element.title);
            assert.isDefined(element._id);
            _.each(element.groups, group => {
                assert.isDefined(group._id);
                assert.isDefined(group.name);
            })
        });
    })
});