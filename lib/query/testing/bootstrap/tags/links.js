import Tags from './collection.js';
import Posts from '../posts/collection.js';

Tags.addLinks({
    posts: {
        collection: Posts,
        inversedBy: 'tags'
    }
});
