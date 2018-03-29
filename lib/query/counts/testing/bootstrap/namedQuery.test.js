import { createQuery } from 'meteor/cultofcoders:grapher';

export const postsQuery = createQuery('counts_posts_query', {
    counts_posts: {
        _id: 1,
        text: 1,
    },
});

export const postsQuery2 = createQuery('counts_posts_query2', {
    counts_posts: {
        $filters: {
            text: 'text 1',
        },
        _id: 1,
        text: 1,
    },
});

export const postsQuery3 = createQuery('counts_posts_query3', {
    counts_posts: {
        $filters: {
            text: {
                $regex: 'text',
                $options: 'i',
            },
        },
        _id: 1,
        text: 1,
    },
});

export default postsQuery;
