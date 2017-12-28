## Global Queries

Global queries are not recommended because they are very hard to secure. If you are not interested
in exposing an API for your clients or expose a public database, [continue reading next part](structure_and_patterns.md)

But they are very interesting in what they offer and they can prove to be very useful. 
You can expose an API that has access to all or certain parts of your database, without
defining a named query for each.

The difference between a `Named Query` and a `Global Query` is that the later
does not have their form defined on the server, the client can query for anything that he wishes
as long as the query is exposed and respects the security restrictions.

A `Global Query` is as almost feature rich as a `Named Query` with the exception of caching.

#### Real life usage

- You have a public database, you just want to expose it
- You have a multi-tenant system, and you want to give full database access to the tenant admin
- Other cases as well

In order to query for a collection from the client-side and fetch it or subscribe to it. You must expose it.

Exposing a collection does the following things:

- Creates a method called: exposure_{collectionName} which accepts a query
- Creates a publication called: exposure_{collectionName} which accepts a query and uses [reywood:publish-composite](https://atmospherejs.com/reywood/publish-composite) to achieve reactive relationships.
- If firewall is specified, it extends *find* method of your collection, allowing an extra parameter:

```
Collection.find(filters, options, userId);
```

If *userId* is undefined, the firewall and constraints will not be applied. If the *userId* is *null*, the firewall will be applied. This is to allows server-side fetching without any restrictions.

#### Exposing a collection to everyone

```js
// server-side
Meteor.users.expose();
```

This means that any user, from the client can do:
```js
createQuery({
    users: {
        services: 1, // yes, everything becomes exposed
        anyLink: {
            anySubLink: {
                // and it can go on and on and on
            }
        }
    }
})
```

Ok this is very bad. Let's secure it.

```js
Meteor.users.expose({
    restrictedFields: ['services'],
    restrictLinks: ['anyLink'], 
});
```

Phiew, that's better. But is it? You'll have to keep track of all the link restrictions.

#### Exposing a collection to logged in users

```js
// server-side
Collection.expose({
    firewall(filters, options, userId) {
        if (!userId) {
            throw new Meteor.Error('...');
        }
    }
});
```

#### Exposure Options

```js
Collection.expose({
    // it can also be an array of functions
    firewall(filters, options, userId) {
        filters.userId = userId;
    },
    // Allow reactive query-ing
    publication: true,
    // Allow static query-in
    method: true,
    // Unblock() the method/publication
    blocking: false,
    // The publication/method will not allow data fetching for more than 100 items.
    maxLimit: 100, 
    // The publication/method will not allow a query with more than 3 levels deep.
    maxDepth: 3,
    // This will clean up filters, options.sort and options.fields and remove those fields from there.
    // It even removes it from deep filters with $or, $nin, etc
    restrictedFields: ['services', 'secretField'],
    // Array of strings or a function that has userId
    restrictLinks: ['link1', 'link2']
});
```

#### Exposure firewalls are linked

When querying for a data-graph like:
```
{
    users: {
        comments: {}
    }
}
```

It is not necessary to have an exposure for *comments*, however if you do have it, and it has a firewall. The firewall rules will be applied.
The reason for this is security.

Don't worry about performance. We went great lengths to retrieve data in as few MongoDB requests as possible, in the scenario above,
if you do have a firewall for users and comments, both will be called only once, because we only make 2 MongoDB requests.

#### Setting Default Configuration

```
import { Exposure } from 'meteor/cultofcoders:grapher';

// Make sure you do this before exposing any collections.
Exposure.setConfig({
    firewall,
    method,
    publication,
    blocking,
    maxLimit,
    maxDepth,
    restrictedFields
});
```

When you expose a collection, it will extend the global exposure methods.
The reason for this is you may want a global limit of 100, or you may want a maximum graph depth of 5 for all your exposed collections,
without having to specify this for each.

Important: if global exposure has a firewall and the collection exposure has a firewall defined as well, 
the collection exposure firewall will be applied. 

##### Taming The Firewall

```js
// Apply filters based on userId
Collection.expose({
    firewall(filters, options, userId) {
        if (!isAdmin(userId)) {
            filters.isVisible = true;
        }
    }
});
```

```js
// Make certain fields invisible for certain users
import { Exposure } from 'meteor/cultofcoders:grapher'
Collection.expose({
    firewall(filters, options, userId) {
        if (!isAdmin(userId)) {
            Exposure.restrictFields(filters, options, ['privateData']);
            // it will remove all specified fields from filters, options.sort, options.fields
            // this way you will not expose unwanted data.
        }
    }
});
```

#### Restrict certain links by userId

Compute restricted links when fetching the query:
```js
Collection.expose({
    restrictLinks(userId) {
        return ['privateLink', 'anotherPrivateLink']
    }
});
```

## Exposure Body 

If *body* is specified, it is first applied on the requested body and then the subsequent rules such as *restrictedFields*, *restrictLinks*
will apply still.

This is for advanced usage and it completes the security of exposure. 

By using body, Grapher automatically assumes you have control over what you give,
meaning all firewalls from other exposures for linked elements in this body will be bypassed. 

The firewall of the current exposure still executes of course.

#### Basic Usage

```js
Meteor.users.expose({
    body: {
        firstName: 1,
        groups: {
            name: 1
        }
    }
})
```

If you query from the *client-side* something like:
```js
createQuery({
    users: {
        firstName: 1,
        lastName: 1,
        groups: {
            name: 1,
            createdAt: 1,
        }
    }
})
```

The intersected body will look like:
```
{
    firstName: 1,
    groups: {
        name: 1,
    }
}
```

Ok, but what if I want to have a different body based on the userId? 
Body can also be a function that takes in an `userId`, and returns an actual body, an `Object`.

```js
Collection.expose({
    body(userId) {
        let body = { firstName: 1 };
        
        if (isAdmin(userId)) {
            _.extend(body, { lastName: 1 })
        }
        
        return body;
    }
})
```

Deep nesting with other links not be allowed unless your *body* specifies it.

The special fields `$filters` and `$options` are allowed at any link level (including root). However, they will go through a phase of cleaning,
meaning it will only allow you to `filter` and `sort` for fields that exist in the body.

This check goes deeply to verify "$and", "$or", "$nin" and "$not" special MongoDB selectors. This way you are sure you do not expose data you don't want to.
Because, given enough requests, a hacker playing with `$filters` and `$sort` options can figure out a field that you may not want to give him access to.

If the *body* contains functions they will be computed before intersection. Each function will receive userId.

```js
{
    linkName(userId) { return {test: 1} }
}

// transforms into
{
    linkName: {
        test: 1
    }
}
```

You can return *undefined* or *false* in your function if you want to disable the field/link for intersection.

```js
{
    linkName(userId) {
        if (isAdmin(userId)) {
            return object;
        }
    }
}
```

#### Linking Grapher Exposure Bodies

Now things start to get crazy around here!

You can link bodies in your own way and also reference other bodies'links.
Functions are computed on-demand, meaning you can have self-referencing body functions:

```js
// Comments ONE link to Users as 'user' 
// Users INVERSED 'user' from Comments AS 'comments'

const commentBody = function(userId) {
    return {
        user: userBody,
        text: 1
    }
}

const userBody = function(userId) {
    if (isAdmin(userId)) {
        return {
            comments: commentBody
        };        
    }
    
    return somethingElse;
}

Users.expose({
    body: userBody
})

Comments.expose({
    body: commentBody
})
```

This will allow requests like:
```js
{
    users: {
        comments: {
            user: {
                // It doesn't make much sense for this case
                // but you can :) 
            }
        }
    }
}
```

## Conclusion

The global queries are a very powerful tool to expose your full database, but unlike `Named Queries` they do
not benefit of `caching`.

## [Continue Reading](structure_and_patterns.md) or [Back to Table of Contents](index.md)
