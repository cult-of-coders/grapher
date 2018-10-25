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
    group: {
        type: 'one',
        collection: Groups,
        metadata: true,
        field: 'groupId'
    },
    authorCached: {
        type: 'one',
        collection: Authors,
        field: 'ownerId',
        denormalize: {
            field: 'authorCache',
            body: {
                name: 1,
                profile: {
                    firstName: 1,
                    lastName: 1,
                }
            }
        }
    },
    tagsCached: {
        collection: Tags,
        type: 'many',
        field: 'tagIds',
        denormalize: {
            field: 'tagsCache',
            body: {
                name: 1
            }
        }
    }
});

Posts.addReducers({
    reducerNonExistentNestedField: {
        body: {
            nested: {
                title: 1,
            }
        },
        reduce(object) {
            return object.nested ? object.nested.title : 'null';
        }
    },
});