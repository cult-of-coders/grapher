import { createNamedQuery } from 'meteor/cultofcoders:grapher';

const query = createNamedQuery('counts_posts_query', {
    counts_posts: {
        _id: 1,
        text: 1,
    },
});

export default query;
