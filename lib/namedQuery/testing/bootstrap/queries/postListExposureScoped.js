import { createQuery } from 'meteor/cultofcoders:grapher';

const postListExposureScoped = createQuery('postListExposureScoped', {
    posts: {
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

if (Meteor.isServer) {
    postListExposureScoped.expose({
        firewall(userId, params) {
        },
        embody: {
            $filter({filters, params}) {
                filters.title = params.title
            }
        }
    });
}

export default postListExposureScoped;