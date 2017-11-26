import { createQuery, MemoryResultCacher } from 'meteor/cultofcoders:grapher';
import postListExposure from './queries/postListExposure.js';

const postList = createQuery('postList', {
    posts: {
        $filter({filters, options, params}) {
            if (params.title) {
                filters.title = params.title;
            }

            if (params.limit) {
                options.limit = params.limit;
            }
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

const postListCached = createQuery('postListCached', {
    posts: {
        title: 1,
    }
});

export {postListCached};

postListCached.cacheResults(new MemoryResultCacher({
    ttl: 400,
}));