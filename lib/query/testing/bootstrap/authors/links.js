import Authors from './collection.js';
import Posts from '../posts/collection.js';
import Comments from '../comments/collection.js';
import Groups from '../groups/collection.js';

Authors.addLinks({
    comments: {
        collection: Comments,
        inversedBy: 'author'
    },
    posts: {
        collection: Posts,
        inversedBy: 'author'
    },
    groups: {
        type: 'many',
        metadata: {},
        collection: Groups,
        field: 'groupIds'
    }
});