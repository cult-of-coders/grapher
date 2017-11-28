import {Mongo} from 'meteor/mongo';

export const Authors = new Mongo.Collection('cache_authors');
export const AuthorProfiles = new Mongo.Collection('cache_author_profiles');
export const Posts = new Mongo.Collection('cache_posts');
export const Groups = new Mongo.Collection('cache_groups');
export const Categories = new Mongo.Collection('cache_categories');

Authors.remove({});
AuthorProfiles.remove({});
Posts.remove({});
Groups.remove({});
Categories.remove({});

Posts.addLinks({
    author: {
        type: 'one',
        collection: Authors,
        field: 'authorId',
        denormalize: {
            field: 'authorCache',
            body: {
                name: 1,
                address: 1,
            }
        }
    },
    categories: {
        type: 'many',
        metadata: true,
        collection: Categories,
        field: 'categoryIds',
        denormalize: {
            field: 'categoriesCache',
            body: {
                name: 1,
            }
        }
    }
});

Authors.addLinks({
    posts: {
        collection: Posts,
        inversedBy: 'author',
        denormalize: {
            field: 'postCache',
            body: {
                title: 1,
            }
        }
    },
    groups: {
        type: 'many',
        collection: Groups,
        field: 'groupIds',
        denormalize: {
            field: 'groupsCache',
            body: {
                name: 1,
            }
        }
    },
    profile: {
        type: 'one',
        metadata: true,
        collection: AuthorProfiles,
        field: 'profileId',
        unique: true,
        denormalize: {
            field: 'profileCache',
            body: {
                name: 1,
            }
        }
    }
});

AuthorProfiles.addLinks({
    author: {
        collection: Authors,
        inversedBy: 'profile',
        unique: true,
        denormalize: {
            field: 'authorCache',
            body: {
                name: 1,
            }
        }
    }
});

Groups.addLinks({
    authors: {
        collection: Authors,
        inversedBy: 'groups',
        denormalize: {
            field: 'authorsCache',
            body: {
                name: 1,
            }
        }
    }
});

Categories.addLinks({
    posts: {
        collection: Posts,
        inversedBy: 'categories',
        denormalize: {
            field: 'postsCache',
            body: {
                title: 1,
            }
        }
    }
});
