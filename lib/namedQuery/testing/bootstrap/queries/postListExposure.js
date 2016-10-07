import { createNamedQuery } from 'meteor/cultofcoders:grapher';

export default createNamedQuery('postListExposure', {
    posts: {
        title: 1,
        author: {
            name: 1
        },
        group: {
            name: 1
        }
    }
});