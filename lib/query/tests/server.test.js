describe('Query Server Tests', function () {
    it('should return the propper data', function () {
        const query = PostCollection.createQuery({
            $filters: {'title': 'Hello'},
            title: 1,
            author: {},
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
            comment_resolve: {}
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
});