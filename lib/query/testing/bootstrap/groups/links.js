import Groups from './collection.js';
import Authors from '../authors/collection.js';
import Posts from '../posts/collection.js';

Groups.addLinks({
    authors: {
        collection: Authors,
        inversedBy: 'groups'
    },
    posts: {
        collection: Posts,
        inversedBy: 'group'
    }
});
