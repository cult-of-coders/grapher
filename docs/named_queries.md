# Named Queries

Before we explain what they are, we need to understand an alternative way of creating the queries.

## Alternative Creation

Currently, we only know how to create a query starting from a collection, like:

```js
Meteor.users.createQuery(body, options);
```

But Grapher also exposes a `createQuery` function:

```js
import {createQuery} from 'meteor/cultofcoders:grapher';

createQuery({
    users: {
        profile: 1,
    }
})
```

The first key inside the object represents an existing collection name:
```js
const Posts = new Mongo.Collection('posts');

// then we can do:
createQuery({
    posts: {
        title: 1
    }
})
```

## What are Named Queries ? 

As the name implies, they are a query that are identified by a `name`.
The difference is that they accept a `string` as the first argument, instead of a body.

The `Named Query` has the same API and options as a normal `Query`, we'll understand the difference in this documentation.

```js
// file: /imports/api/users/queries/userAdminList.js
export default Meteor.users.createQuery('userAdminList', {
    $filters: {
        roles: {$in: 'ADMIN'}
    },
    name: 1,
})
```

If you would like to use this query you have two ways:
```js
import userAdminListQuery from '/imports/db/users/queries/userAdminList.js';

const admins = userAdminListQuery.fetch();
```

Or you could use `createQuery`:
```js
import {createQuery} from 'meteor/cultofcoders:grapher';

const admins = createQuery({
    userAdminList: params, // or {} if no params
}).fetch(); 
// will return a clone of the named query, with the params specified
```

Because `Named Queries` have their form well defined, they don't allow you to specify fields directly, 
however they allow you to specify parameters when using `createQuery`

Because the default `$filter()` allows as params `filters` and `options` for the top collection node,
you can do something like:

```js
const admins = createQuery({
    userAdminList: {
        options: {createdAt: -1}
    },
}).fetch();
```

## Go Modular, Always.

Of course the recommended approach is to always use `modular`. Creating queries in files, and importing them accordingly.
The reason we expose such functionality is because if you want to use [Grapher as an HTTP API](outside_grapher.md), 
you do not have access to the collections, so this becomes very handy, as you can transform a JSON request into a query.

In the client-side of Meteor it is recommended to always extract your queries into their own module, and import and clone them for use.

## Special $body

`Named Queries` treat specially the `$body` parameter. Let's see an advanced query:

```js
const fullPostList = Posts.createQuery('fullPostList', {
    title: 1,
    author: {
        firstName: 1,
        lastName: 1,
    },
    comments: {
        text: 1,
        createdAt: 1,
        author: {
            firstName: 1,
            lastName: 1,
        }
    }
})
```

There will be situations where you initially want to show less data for this, maybe just the `title`, but if the user,
clicks on that `title` let's say we want it to expand and then we need to fetch additional data.

Instead of creating an additional `Named Query` with the same firewalls and such, you can use `$body` which intersects with the allowed data graph:
```js
fullPostsList.clone({
    $body: {
        title: 1,
        author: {
            firstName: 1,
            services: 1, // will be removed after intersection, and not queried
        },
        otherLink: {} // will be removed after intersection, and not queried
    }
})
```

This will only fetch the intersection, the transformed body will look like:
```js
{
    title: 1,
    author: {firstName: 1}
}
```

Be careful, if you use validation for params (and you should) to also add `$body` inside it.

```js
import {Match} from 'meteor/check';
const fullPostList = Posts.createQuery('fullPostList', {}, {
    validateParams: {
        $body: Match.Maybe(Object),
    }
});
```

## Exposure

We are now crossing the bridge to client-side. It's a nasty place, filled with hacker, haxors, crackers,
we cannot trust them, we need to make the code unbreakable. 

We initially said that Grapher will become the `Data Fetching Layer` inside Meteor. 
Therefore, we will no longer rely on methods to give us the data from our queries, even if it's still possible 
and up to you to decide, but this gives you many advantages, such as [Caching Results](caching_results.md) and performance monitoring
though Kadira/Meteor APM (because every named query exposed is a method and/or a publication)

As you may have guessed, the exposure needs to happen on the server, but the query can be imported on the client.

Let's say we want only users that are admins to be able to query our `userAdminList` query:

```js
// file: /imports/api/users/queries/userAdminList.js
export default Meteor.users.createQuery('userAdminList', {
    $filters: {
        roles: {$in: 'ADMIN'}
    },
    name: 1,
})
```

```js
// server-side 
// make sure it's imported from somewhere on the server only
// file: /imports/api/users/queries/userAdminList.expose.js
import userAdminListQuery from './userAdminList';

userAdminListQuery.expose({
    firewall(userId, params) {
        if (!Roles.userIsInRole(userId, 'ADMIN')) {
            throw new Meteor.Error('not-allowed');
        }
        
        // in the firewall you also have the ability to modify the parameters
        // that are going to hit the $filter() function in the query
        
        // the firewall runs in the Meteor.methods or Meteor.publish context
        // Meaning you can have access to this.userId and others.
    }
})
```

## Client-side 

Let's use it on the client side:
```js
// client side
import userAdminListQuery from '/imports/api/users/queries/userAdminList.js';

userAdminListQuery.clone().fetch((err, users) => {
    // it will be an error if the current user is not an admin, thrown by the firewall
});
```

A beautiful part of Grapher lies in it's polymorphic ability, you can have a reactive query, just by using the same API:

```js
import {Tracker} from 'meteor/tracker';
import userAdminListQuery from '/imports/api/users/queries/userAdminList.js';

const query = userAdminListQuery.clone();
const subscriptionHandle = query.subscribe();
// if we did subscribe, we no longer need to supply a callback for fetch()
// as the query morphed into a reactive query

Tracker.autorun(() => {
    if (subscriptionHandle.ready()) {
        console.log(query.fetch());
        query.unsubscribe();
    }
})
```

You can do `meteor add tracker` if it complains it's missing `Tracker`.


You can also use `fetchOne()` on the client as well, even supply a callback:
```js
userAdminListQuery.clone().fetchOne((err, user) => {
    // do something
});
```

You can use `fetchSync()` or `fetchOneSync()` to work with promises. 

```js
const users = await userAdminListQuery.clone().fetchSync();
const user = await userAdminListQuery.clone().fetchOneSync();
```

## Counters

You can of course use the same paradigm to use counts:
```js
// static query
query.getCount((err, count) => {
    // do something
});

// promises
const count = await query.getCountSync();

// reactive counts
const handle = query.subscribeCount();

Tracker.autorun(() => {
    if (handle.ready()) {
        console.log(query.getCount());
        query.unsubscribeCount();
    }
});
```

We do not subscribe to counts by default because they may be too expensive, especially for large collections,
but if you need them, feel free to use them, we worked hard at making them as performant as possible.

## Behind the scenes

When we are dealing with a static query (non-reactive), we make a call to the method that has been created when
we did `query.expose()`, params get checked, the firewall gets applied and returns the result from the query.

If we have a reactive query, `query.expose()` creates a publication end-point, and inside it, uses the `reywood:publish-composite` package
to automatically create the proper publication.

The method and publication names we create are: `named_query_${queryName}`, and as argument they accept the `params` object.

Meaning you can do:
- `Meteor.call('named_query_userAdminList', params, callback)`
- `Meteor.subscribe('named_query_userAdminList', params)`

But don't. Grapher takes care of this.

When we do `query.fetch()` on a reactive query, it gives you a complete data graph with the items in the same form as you
would have received from a static query. When an element inside your data graph changes, the `fetch()` function is re-run
if you are inside a `Tracker.autorun()` or a reactive context, because in the back, it does `find().fetch()` on client-side collections,
and afterwards it assembles your data.

## Warning

If you want your client-side **reactive** queries to work as expected you need to make sure that the
`addLinks` and `addReducers` are loaded on the client as well, otherwise Grapher won't know how to assemble your data.

## Expose Options

```js
query.expose({
    // Secure your query
    firewall(userId, params) {
        // you can modify the parameters here
    },
    
    // Allow the query to be fetched statically
    method: true, // default
    
    // Allow the query to be fetched reactively (for heavy queries, you may want to set it to false)
    publication: true, // default
    
    // Unblocks your method (and if you have .unblock() in publication context it also unblocks it)
    unblock: true,  // default
    
    // This can be an object or a function(params) that you don't want to expose it on the client via
    // The query options as it may hold some secret business data
    // If you don't specify it the default validateParams from the query applies, but not both!
    // If you allow subbody requests, don't forget to add {$body: Match.Maybe(Boolean)}
    validateParams: {},
    
    // This deep extends your graph's body before processing it.
    // For example, you want a hidden $filter() functionality, or anything else.
    embody: {}, // Accepts Object or Function(body, params)
})
```

## Embodyment

When you expose a query, you may want to perform some additional extensions server-side to it,
like create a custom $filter() that hides the logic, or uses the userId passed-on via `params` object by the firewall.

`embody` option can be an `Object` or a `Function` that has `(body, params)` as a signature, and the purpose of that function is the modify `body`.

Examples:
```js
query.expose({
    firewall(userId, params) {
        params.userId = userId,
    },
    embody: {
        // This will deepExtend your body
        $filter({filters, params}) {
            filters.userId = params.userId;
        }
    }
})
```

Using this, you will be absolutely sure that regardless of the parameters sent by the `client`, the
propper userId is applied. Please note, that $filter() will override a pre-existing $filter() of the query.

If we would like to use `embody` as a function:
```js
query.expose({
    firewall(userId, params) {
        params.userId = userId,
    },
    embody(body, params) {
        body.$filters = body.$filters || {}; // make sure it has it first.
        Object.assign(body.$filters, {
            userId: params.userId
        });

        // if you find it easier, you can also do: body.$filter = ({filters}) => { ... } 
    }
})
```

Careful here, if you use the special `$body` parameter, embodyment will be performed on it. You have to handle manually these use-cases, but usually, you will use `embody` for filtering top level elements, so in most cases it will be simple and with no hassle.

## Resolvers

Named Queries have the ability to morph themselves into a function that executes on the server.
There are situations where you want to retrieve some data, that is not necessarily inside a collection,
or it needs additional operations to give you the correct result.

For example, let's say you want to provide the user with some analytic results, that perform some heavy
aggregations on the database, or call some external APIs.

```js
// shared code between client and server
const getAnalytics = createQuery('getAnalytics', () => {}, {
    validateParams: {} // Object or Function
});
```

Not the dummy `() => {}`. That's how we tell Grapher to make a resolver query.

```js
// server code only
import getAnalyticsQuery from './getAnalytics';

getAnalyticsQuery.expose({
    firewall(userId, params) {
        params.userId = userId;
    },
    validateParams: {} // Object or Function that you don't want exposed
});

getAnalyticsQuery.resolve(function(params) {
    // perform your magic here
    // you are in `Meteor.method` context, so you have access to `this.userId`
})
```

The advantage of doing things like this, instead of relying on a method, is that you are now
using a uniform layer for fetching data, and on top of that, you can [easily cache them](caching_results.md).

If you try to `subscribe()` to a resolver query on the client it will throw an exception.

## Mix'em up

The `firewall` can also be an array of functions. Allowing you to easily expose a query like:

```js
function checkLoggedIn(userId, params) {
    if (!userId) {
        throw new Meteor.Error('not-allowed');
    }
}

query.expose({
    firewall: [checkLoggedIn, (userId, params) => {
        params.userId = userId;
        // other stuff here if you want
    }]
})
```

## Scoped publications

Scoped publications add a scope (context) to their published documents with the goal of client being able to distinguish between documents of different publications or different grapher paths in the same publication.

Problems often arise when using only server-side filtering.

Consider the following situation:

```js
// the query
const usersQuery = Users.createQuery('getUsers', {
    name: 1,
    friends: {
        name: 1,
    },
}, {
    scoped: true,
});

// server-side exposure
usersQuery.expose({
    embody: {
        $filter({filters, params}) {
            filters.name = params.name;
        }
    }
});

// links
Users.addLinks({
    friends: {
        collection: Users,
        field: 'friendIds',
        type: 'many'
    },
});
```

Notice that `friends` is a link from Users to Users collection. Also, we have server-side filtering (see exposure).
On the client, we want to fetch reactively one user by name, but we are going to get all of his friends, too, and that is because of the `friends` link.
```js
// querying for user John
withQuery(props => {
    return usersQuery.clone({
        name: 'John',
    });
}, {
    reactive: true,
})(SomeComponent);
```

Client receives queried user (John) and all of his friends into the local Users collection.
By passing `{scoped: true}` query parameter to the `createQuery()`, client-side recursive fetching is now able to distinguish between queried user and his friends.

### Technical details
Continuing on the example above, there are two pieces on how server and client achieve this functionality.

#### Subscription scope
Each subscription adds `_sub_<subscriptionId>` field to its documents. For example, a User document could look like this:
```
{
    name: 'John',
    _sub_1: 1,
    _sub_2: 1
}
```
This way we ensure that there is no mixup between the subscriptions (i.e. between two reactive queries on the client).

#### Query path scope
Now suppose Alice is John's friend. Both Alice and John would have the same `_sub_<id>` field for our example query and we would get both instead of only John.
This part is solved by adding "query path" field to the docs, in format `_query_path_<namespace>` where namespace is path constructed from collection name and link names, for example:
```
{
    name: 'John',
    _sub_1: 1,
    _query_path_users: 1,
},
{
    name: 'Alice',
    _sub_1: 1,
    // deeper nesting than John's
    _query_path_users_friends: 1 
}
```

where Alice has namespace equal to `users_friends` and client-side recursive fetching can now distinguish between the documents that should be returned as a query result (John) and as a `friends` link results for John (which is Alice).

By adding query path field into the documents, we ensure that there is no mixup between the documents in the same reactive query (i.e. subscription).

## Setting Default Configuration
If you want all you named queries to be, for example, scoped, you can do this with `NamedQuery.setConfig`.
```
import {NamedQuery} from 'meteor/cultofcoders:grapher';
NamedQuery.setConfig({scoped: true});
```

Do this in a code that is loaded both on server and a client.

## Conclusion

We can now safely expose our queries to the client, and the client can use it in a simple and uniform way.
By this stage we already understand how powerful Grapher really is, but it still has some tricks up it's sleeve.

## [Continue Reading](hypernova.md) or [Back to Table of Contents](index.md)

