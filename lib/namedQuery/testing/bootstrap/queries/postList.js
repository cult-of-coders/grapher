import { createQuery, MemoryResultCacher } from 'meteor/cultofcoders:grapher';

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
}, {
    scoped: true,
});

export default postList;