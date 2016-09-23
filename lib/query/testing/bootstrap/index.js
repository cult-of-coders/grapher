import './comments/links';
import './posts/links';
import './authors/links';
import './tags/links';
import './groups/links';

import Posts from './posts/collection.js';

if (Meteor.isServer) {
    Posts.expose();
}
