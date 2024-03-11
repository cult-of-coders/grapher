import Comments from './collection.js';
import Authors from '../authors/collection.js';
import Posts from '../posts/collection.js';

Comments.addLinks({
    author: {
        type: 'one',
        collection: Authors,
        field: 'authorId',
        index: true,
        denormalize: {
            field: 'authorCache',
            body: { _id: 1, name: 1, groupsCache: 1 },
        }
    },

    post: {
        type: 'one',
        collection: Posts,
        field: 'postId',
        index: true
    }
});

Comments.addReducers({
    authorLinkReducer: {
        body: {
            author: {
                name: 1,
            },
        },
        reduce(object) {
            return object.author;
        }
    }
});
