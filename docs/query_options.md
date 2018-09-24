# Query Options

Let's learn what a query can do, we know it can fetch related links, but it has some
interesting features.

## Nested fields

Most likely you will have documents which organize data inside an object, such as `user` may have a `profile` object
that stores `firstName`, `lastName`, etc

Grapher automatically detects these fields, as long as there is no link named `profile`:

```js
const user = Meteor.users.createQuery({
    $filters: {_id: userId},
    profile: {
        firstName: 1,
        lastName: 1,
    }
}).fetchOne();
```

Now `user` will look like:
```
{
    _id: userId,
    profile: {
        firstName: 'John',
        lastName: 'Smith',
    }
}
```

If you want to fetch the full `profile`, use `profile: 1` inside your query body. Alternatively,
you can also use `'profile.firstName': 1` and `'profile.lastName': 1` but it's less elegant.

## Deep filtering

Lets say we have a `Post` with `comments`:

```js
import {Comments, Posts} from '/imports/db';

Comments.addLinks({
    post: {
        type: 'one',
        field: 'postId',
        collection: Posts,
    },
});

Posts.addLinks({
    comments: {
        collection: Comments,
        inversedBy: 'post',
    }
})
```

If any bit of the code written above creates confusion, take another look on [Linking Collections](linking_collections.md).

We already know that we can query with `$filters`, `$options`, `$filter` and have some parameters.
The same logic applies for child collection nodes:

```js
Posts.createQuery({
    title: 1,
    comments: {
        $filters: {
            isApproved: true,
        },
        text: 1,
    }
})
```

The query above will fetch as `comments` only the ones that have been approved and that are linked with the `post`.

The `$filter` function shares the same `params` across all collection nodes:

```js
export default Posts.createQuery({
    $filter({filters, params}) {
        if (params.lastWeekPosts) {
            filters.createdAt = {$gt: date}
        }    
    },
    $options: {createdAt: -1},
    title: 1,
    comments: {
        $filter({filters, params}) {
            if (params.approvedCommentsOnly) {
                filters.isApproved = true;
            }  
        },
        $options: {createdAt: -1},
        text: 1,
    }
})
```

```js
const postsWithComments = postListQuery.clone({
    lastWeekPosts: true,
    approvedCommentsOnly: true
}).fetch();
```

### Default $filter()

The $filter is a function that defaults to:
```js
function $filter({filters, options, params}) {
    if (params.filters) {
        Object.assign(filters, params.filters);
    }
    if (params.options) {
        Object.assign(filters, params.options)
    }
}
```

Which basically means you can easily configure your filters and options through params:
```js
const postsQuery = Posts.createQuery({
    title: 1,
});

const posts = postQuery.clone({
    filters: {isApproved: true},
    options: {
        sort: {createdAt: -1},
    }
}).fetch();
```

If you like to disable this functionality, add your own $filter() function or use a dummy one:
```js
{
    $filter: () => {},
}
```

Note the default $filter() only applies to the top collection node, otherwise we would have headed into a lot of trouble.

### Pagination

There is a special field that extends the pre-fetch filtering process, and it's called `$paginate`, that allows us
to receive `limit` and `skip` params:

```js
const postsQuery = Posts.createQuery({
    $filter({filters, params}) {
        filters.isApproved = params.postsApproved;
    },
    $paginate: true,
    title: 1,
});

const page = 1;
const perPage = 10;

const posts = postsQuery.clone({
    postsApproved: true,
    limit: perPage,
    skip: (page - 1) * perPage
}).fetch()
```

This was created for your convenience, as pagination is a common used technique and makes your code easier to read.

Note that it doesn't override the $filter() function, it just applies `limit` and `skip` to the options, before `$filter()` runs.
It only works for the top level node, not for the child collection nodes.

### Meta Filters

Let's say we have `users` that belong in `groups` and they have some roles attached in the link description:

```js
import {Groups} from '/imports/db';

Meteor.users.addLinks({
    groups: {
        type: 'many',
        collection: Groups,
        field: 'groupLinks',
        metadata: true,
    }
});

Groups.addLinks({
    users: {
        collection: Meteor.users,
        inversedBy: 'groups',
    }    
})
```

Let's assume the `groupLinks` looks like this:
```js
[
    {
        _id: 'groupId',
        roles: ['ADMIN']
    }
]
```

And you want to query users and fetch only the groups he is admin in:
```js
const users = Meteor.users.createQuery({
    name: 1,
    groups: {
        $filters: {
            $meta: {
                roles: {$in: 'ADMIN'}
            }
        }
    }
}).fetch()
```

But what if you want to fetch the groups and all their admins? It's the same.

```js
const groups = Groups.createQuery({
    name: 1,
    users: {
        $filters: {
            $meta: {
                roles: {$in: 'ADMIN'}
            }
        }
    }
}).fetch()
```

We have gone through great efforts to support such functionality, but it makes our code so easy to read and it doesn't impact performance.

## Post Filtering

This concept allows us to filter/manipulate data after we retrived it and assembled it.

The `$postFilters` option uses the `sift` npm library (https://www.npmjs.com/package/sift) to make your filters look like MongoDB filters.

For example, what if you want to get the users that are admins in at least one group:

```js
const users = Meteor.users.createQuery({
    $postFilters: {
        'groups.$metadata.roles': {$in: 'ADMIN'},  
    },
    name: 1,
    groups: {
        name :1,
    }
}).fetch()
```

If you had a `many` relationship without metadata your `$postFilters` would look like:
```
{
    'groups.roles': {$in: 'ADMIN'},  
}
```

In addition to `$postFilters` we've also got `$postOptions` that allows:
- limit
- sort
- skip

They work exactly like you expect from $options, the difference is that they are applied after the data has been fetched.
```js
const users = Meteor.users.createQuery({
    $postOptions: {
        sort: {'groups.name': 1},
    },
    name: 1,
    groups: {
        name :1,
    }
}).fetch()
```

And to offer you full flexibility, we also allow a `$postFilter` function that needs
to return the new set of results.

```js
const users = Meteor.users.createQuery({
    $postFilter(results, params) {
        if (params.mustHaveGroupsAsAdmin) {
            return results.filter(r => {
                // your filter goes here.
            });
        }
    },
    name: 1,
    groups: {
        name: 1,
    }
}, {
    params: {
        mustHaveGroupsAsAdmin: true
    },
}).fetch()
```

Note the fact that these special fields only work for `top level nodes`, not for child collection nodes unlike `$filters`, `$options`, and `$filter`.

This type of queries that rely on post processing, can prove to be costly in some cases, because it will still fetch the users from the database
that don't have a group in which they are admin. There are alternatives to this to this in the [Denormalization](denormalization.md) section of the documentation.

It really depends on your context, but `$postFilters`, `$postOptions` and `$postFilter` can be very useful in some cases.

## Counters

If you want just to return the number of top level documents a query has:

```js
query.getCount()
```

This will be very useful for pagination when we reach the client-side domain, or you just need a count.
Note that `getCount()` applies only the processed `filters` but not `options`.

## Mix'em up

Both functions `$filter` and `$postFilter` also allow you to provide an array of functions:

```js
function userContext({filters, params}) {
    if (!params.userId) {
        throw new Meteor.Error('not-allowed');
    }
    
    filters.userId = params.userId;
}

const posts = Posts.createQuery({
    $filter: [userContext, ({filters, options, params}) => {
        // do something
    }],
}).fetch()
```

The example above is just to illustrate the possibility, in order to ensure that a `userId` param is sent you will use `validateParams`.

```js
Posts.createQuery({
    $filter({filters, options, params}) {
        filters.userId = params.userId;
    },
    title: 1,
}, {
    validateParams: {
        userId: String
    }
})
```

Validating params will also protect you from injections such as:

```js
const query = postLists.clone({
    userId: {$nin: []},
})
```

When we cross to the client-side domain we need to be very wary of these type of injections.

## Conclusion

Query is a very powerful tool, very flexible, it allows us to do very complex things that would have taken us a lot of time
to do otherwise. 

## [Continue Reading](reducers.md) or [Back to Table of Contents](index.md)



