import { createNamedQuery } from 'meteor/cultofcoders:grapher';
import postListExposure from './queries/postListExposure.js';

const postList = createNamedQuery('postList', {
    posts: {
        $filter({filters, params}) {
            filters.title = params.title
        },
        title: 1,
        author: {
            name: 1
        },
        group: {
            name: 1
        }
    }
});

export { postList };
export { postListExposure };

postListExposure.expose({
    firewall(userId, params) {
    },
    embody: {
        $filter({filters, params}) {
            filters.title = params.title
        }
    }
});
