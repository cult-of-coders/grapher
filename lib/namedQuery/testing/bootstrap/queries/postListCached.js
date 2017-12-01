import { createQuery, MemoryResultCacher } from 'meteor/cultofcoders:grapher';

const postListCached = createQuery('postListCached', {
    posts: {
        title: 1,
    }
});

postListCached.cacheResults(new MemoryResultCacher({
    ttl: 200,
}));

export default postListCached;
