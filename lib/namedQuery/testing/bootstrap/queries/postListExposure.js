import { createQuery } from 'meteor/cultofcoders:grapher';

const postListExposure = createQuery('postListExposure', {
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

export const postListFilteredWithDate = createQuery('postListFilteredWithDate', {
    posts: {
        $filter({filters, options, params}) {
            if (params.date) {
                filters.createdAt = {$lte: params.date}
            }
        },
        createdAt:1,
    }
});

if (Meteor.isServer) {
    postListExposure.expose({
        firewall(userId, params) {
        },
        embody: {
            $filter({filters, params}) {
                filters.title = params.title
            }
        }
    });
    postListFilteredWithDate.expose({});
}

export default postListExposure;