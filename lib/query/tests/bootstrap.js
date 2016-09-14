PostCollection = new Mongo.Collection('test_query_post');
CommentCollection = new Mongo.Collection(('test_query_comment'));
GroupCollection = new Mongo.Collection(('test_query_group'));
AuthorCollection = new Mongo.Collection(('test_query_author'));

PostCollection.addLinks({
    'comments': {
        collection: CommentCollection,
        type: '*'
    },
    'groups': {
        collection: GroupCollection,
        type: '*',
        metadata: {
            isAdmin: {type: String}
        }
    },
    author: {
        collection: AuthorCollection,
        type: 'one'
    },
    comment_resolve: {
        resolve(object) {
            return CommentCollection.find({resourceId: object._id}).fetch();
        }
    }
});

CommentCollection.addLinks({
    author: {
        collection: AuthorCollection,
        type: '1'
    }
});