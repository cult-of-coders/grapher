import Posts from './collection.js';
import Authors from '../authors/collection.js';
import Comments from '../comments/collection.js';
import Tags from '../tags/collection.js';
import Groups from '../groups/collection.js';

Posts.addLinks({
    author: {
        type: 'one',
        collection: Authors,
        field: 'ownerId',
        index: true
    },
    comments: {
        collection: Comments,
        inversedBy: 'post'
    },
    tags: {
        collection: Tags,
        type: 'many',
        field: 'tagIds',
        index: true
    },
    commentsCount: {
        resolve(post) {
            return Comments.find({postId: post._id}).count();
        }
    },
    group: {
        type: 'one',
        collection: Groups,
        metadata: {},
        field: 'groupId'
    }
});