Collection Exposure
===================

In order to query for a collection from the client-side and fetch it or subscribe to it. You must expose it.


Exposing a collection does the following things:

- Creates a method called: exposure_{collectionName} which accepts a query
- Creates a publication called: exposure_{collectionName} which accepts a query and uses [reywood:publish-composite](https://atmospherejs.com/reywood/publish-composite) to achieve reactive relationships.
- If firewall is specified, it extends *find* method of your collection, allowing an extra parameter:
```
Collection.find(filters, options, userId);
```
- Important note: If userId is undefined, the firewall and constraints will not be applied. If the userId is null, they will be applied. This is to allow server-side fetching without any restrictions.


Exposing a collection to everyone
---------------------------------

```
Collection.expose()
```

Exposing a collection to logged in users
----------------------------------------

```
Collection.expose((filters, options, userId) {
    if (!userId) {
        throw new Meteor.Error('...');
    }
});
```

Enforcing limits
----------------

```
Collection.expose({
    firewall(filters, options, userId) {
        filters.userId = userId;
    }
    maxLimit: 100, // The publication/method will not allow data fetching for more than 100 items. (Performance related)
    maxDepth: 3 // The publication/method will not allow a query with more than 3 levels deep. (Performance related)
    restrictedFields: ['services', 'secretField'] // this will clean up filters, options.sort and options.fields and remove those fields from there.
});
```


Exposure firewalls are linked.
------------------------------

When querying for a data-graph like:
```
{
    users: {
        comments: {}
    }
}
```

It is not necessary to have an exposure for *comments*, however if I do have it, and it has a firewall. The firewall will be called.
The reason for this is security.


Global Exposure Configuration
-----------------------------
```
import { Exposure } from 'meteor/cultofcoders:grapher';

// Make sure you do this before exposing any collections.
Expose.setConfig({
    firewall,
    maxLimit,
    maxDepth,
    restrictFields
});
```


When you expose a collection, it will extend the global exposure methods.
The reason for this is you may want a global limit of 100, or you may want a maximum graph depth of 5 for all your exposed collections,
without having to specify this for each.

Important: if global exposure has a firewall and the collection exposure has a firewall defined as welll, the collection exposure firewall will be applied. 

Taming The Firewall
-------------------

```
// control what to show

Collection.expose((filters, options, userId) => {
    if (!isAdmin(userId)) {
        filters.isVisible = true;
    }
});
```

```
// make certain fields invisible for certain users
import { Exposure } from 'meteor/cultofcoders:grapher'
Collection.expose((filters, options, userId) => {
    if (!isAdmin(userId)) {
        Exposure.restrictFields(filters, options, ['privateData'])
        // it will remove all specified fields from filters, options.sort, options.fields
        // this way you will not expose unwanted data.
    }
});
```

### Next step

[Read about Query](query.md)