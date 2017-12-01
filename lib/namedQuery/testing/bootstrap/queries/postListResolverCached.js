import { createQuery, MemoryResultCacher } from 'meteor/cultofcoders:grapher';

const postList = createQuery('postListResolverCached', () => {});

if (Meteor.isServer) {
    postList.expose({});

    postList.resolve(params => {
        return [
            params.title
        ];
    });

    postList.cacheResults(new MemoryResultCacher({
        ttl: 200,
    }));
}

export default postList;