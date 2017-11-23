import { createQuery } from 'meteor/cultofcoders:grapher';

export default createQuery('postListExposure', {
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