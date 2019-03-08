import Authors from './collection.js';
import Posts from '../posts/collection.js';
import Comments from '../comments/collection.js';
import Groups from '../groups/collection.js';

Authors.addLinks({
    comments: {
        collection: Comments,
        inversedBy: 'author'
    },
    posts: {
        collection: Posts,
        inversedBy: 'author'
    },
    groups: {
        type: 'many',
        metadata: true,
        collection: Groups,
        field: 'groupIds'
    }
});

Authors.addReducers({
    fullName: {
        body: {
            name: 1
        },
        reduce(object, params) {
            return (
                'full - ' +
                object.name +
                (params && params.suffix ? params.suffix : null)
            );
        }
    },
    groupNames: {
        body: {
            groups: {
                name: 1
            }
        },
        reduce(object) {
            if (object.groups) {
                return object.groups.map(group => 'G#' + group.name);
            }
        }
    },
    referenceReducer: {
        body: {
            fullName: 1
        },
        reduce(object) {
            return 'nested - ' + object.fullName;
        }
    },
    fullNameNested: {
        body: {
            profile: {
                firstName: 1,
                lastName: 1
            }
        },
        reduce(object) {
            if (!object.profile) {
                return null;
            }

            return object.profile.firstName + ' ' + object.profile.lastName;
        }
    },
    // testing clearing nested fields specified as both profile: 1 and profile: {firstName: 1} in reducers
    fullNameNested2: {
        body: {
            profile: 1,
        },
        reduce(object) {
            return 'nested 2';
        }
    },
    paramBasedReducer: {
        body: {
            _id: 1
        },
        reduce(object, params) {
            return params.element;
        }
    },

    commentsReducer1: {
        body: {
            posts: {
                authorCached: {
                    name: 1,
                },
            }
        },
        reduce(object) {
            return _.first(object.posts).authorCached.name + ' - 1';
        }
    },
    commentsReducer2: {
        body: {
            posts: {
                authorCached: {
                    name: 1,
                    // this tests cleanReducerLeftovers for snapCache fields
                    profile: {
                        lastName: 1,
                    }
                },
                metadata: {
                    keywords: 1
                },
            }
        },
        reduce(object) {
            const firstPost = _.first(object.posts);
            return {
                author: firstPost.authorCached,
                metadata: {...firstPost.metadata},
            };
        }
    }
});
