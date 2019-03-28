import './comments/links';
import './posts/links';
import './authors/links';
import './tags/links';
import './groups/links';
import './security/links';
import './users/links';
import './files/links';
import './projects/links';

import Posts from './posts/collection';
import Groups from './groups/collection';
import Authors from './authors/collection';
import Users from './users/collection';
import {Files} from './files/collection';
import {Projects} from './projects/collection';

if (Meteor.isServer) {
    Posts.expose();
    Groups.expose();
    Authors.expose();
    Users.expose();
    Files.expose();
    Projects.expose();
}
