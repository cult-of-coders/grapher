import { createQuery, MemoryResultCacher } from 'meteor/cultofcoders:grapher';

const postList = createQuery('postListResolver', () => {});

if (Meteor.isServer) {
    postList.expose({});

    postList.resolve(params => {
        return [
            params.title
        ];
    })
}

export default postList;
