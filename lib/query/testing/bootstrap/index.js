import './comments/links';
import './posts/links';
import './authors/links';
import './tags/links';
import './groups/links';
import './security/links';
import './users/links';

import Posts from './posts/collection';
import Groups from './groups/collection';
import Authors from './authors/collection';
import Users from './users/collection';

if (Meteor.isServer) {
    Posts.expose();
    Groups.expose();
    Authors.expose();
    Users.expose();
}
